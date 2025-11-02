const Meal = require('../models/meal.model');
const FoodItem = require('../models/foodItem.model');
const { validationResult } = require('express-validator');
const {
  VITAMIN_KEYS,
  MINERAL_KEYS,
  LIPID_KEYS,
  MICRO_RDA,
} = require('../utils/nutrients');

// @desc    Create a new meal
// @route   POST /api/meals
// @access  Private
exports.createMeal = async (req, res) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { name, mealType, items, date, notes, isTemplate } = req.body;

  try {
    // Verify all food items exist and get their nutrition info
    const mealItems = [];
    
    for (const item of items) {
      const foodItem = await FoodItem.findById(item.foodItem);
      if (!foodItem) {
        return res.status(404).json({ message: `Food item ${item.foodItem} not found` });
      }

      // Calculate nutrition for the specified amount
      const nutrition = foodItem.getNutritionForServing(item.amount, item.unit);
      const nutritionSnapshot = JSON.parse(JSON.stringify(nutrition));

      mealItems.push({
        foodItem: foodItem._id,
        name: foodItem.name,
        amount: item.amount,
        unit: item.unit,
        nutrition: nutritionSnapshot,
        notes: item.notes || '',
      });
    }

    // Create new meal
    const meal = new Meal({
      user: req.user.id,
      name,
      mealType,
      items: mealItems,
      date: date || new Date(),
      notes,
      isTemplate: isTemplate || false,
    });

    // Save meal to database
    await meal.save();

    // Populate food items for the response
    await meal.populate('items.foodItem');

    res.status(201).json(meal);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get all meals for the logged-in user
// @route   GET /api/meals
// @access  Private
exports.getMeals = async (req, res) => {
  const { startDate, endDate, mealType, isTemplate, limit = 10, page = 1 } = req.query;
  
  try {
    const query = { user: req.user.id };
    
    // Add date range filter if provided
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999); // End of the day
        query.date.$lte = end;
      }
    }
    
    // Add meal type filter if provided
    if (mealType) {
      query.mealType = mealType;
    }
    
    // Filter by template status if provided
    if (isTemplate !== undefined) {
      query.isTemplate = isTemplate === 'true';
    }
    
    // Pagination
    const pageSize = parseInt(limit, 10);
    const skip = (parseInt(page, 10) - 1) * pageSize;
    
    // Get total count for pagination
    const total = await Meal.countDocuments(query);
    
    // Get meals with pagination
    const meals = await Meal.find(query)
      .sort({ date: -1, createdAt: -1 })
      .skip(skip)
      .limit(pageSize)
      .populate('items.foodItem');
    
    res.json({
      meals,
      page: parseInt(page, 10),
      pages: Math.ceil(total / pageSize),
      total,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get meal by ID
// @route   GET /api/meals/:id
// @access  Private
exports.getMealById = async (req, res) => {
  try {
    const meal = await Meal.findOne({
      _id: req.params.id,
      user: req.user.id,
    }).populate('items.foodItem');

    if (!meal) {
      return res.status(404).json({ message: 'Meal not found' });
    }

    res.json(meal);
  } catch (error) {
    console.error(error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Meal not found' });
    }
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update a meal
// @route   PUT /api/meals/:id
// @access  Private
exports.updateMeal = async (req, res) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { name, mealType, items, date, notes, isTemplate } = req.body;

  try {
    let meal = await Meal.findOne({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!meal) {
      return res.status(404).json({ message: 'Meal not found' });
    }

    // If items are being updated, verify all food items exist and get their nutrition info
    let mealItems = [];
    if (items) {
      for (const item of items) {
        const foodItem = await FoodItem.findById(item.foodItem);
        if (!foodItem) {
          return res.status(404).json({ message: `Food item ${item.foodItem} not found` });
        }

        // Calculate nutrition for the specified amount
        const nutrition = foodItem.getNutritionForServing(item.amount, item.unit);
        const nutritionSnapshot = JSON.parse(JSON.stringify(nutrition));

        mealItems.push({
          foodItem: foodItem._id,
          name: foodItem.name,
          amount: item.amount,
          unit: item.unit,
          nutrition: nutritionSnapshot,
          notes: item.notes || '',
        });
      }
    }

    // Update meal fields
    meal.name = name !== undefined ? name : meal.name;
    meal.mealType = mealType !== undefined ? mealType : meal.mealType;
    meal.items = items !== undefined ? mealItems : meal.items;
    meal.date = date !== undefined ? date : meal.date;
    meal.notes = notes !== undefined ? notes : meal.notes;
    meal.isTemplate = isTemplate !== undefined ? isTemplate : meal.isTemplate;

    // Save updated meal
    await meal.save();

    // Populate food items for the response
    await meal.populate('items.foodItem');

    res.json(meal);
  } catch (error) {
    console.error(error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Meal not found' });
    }
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete a meal
// @route   DELETE /api/meals/:id
// @access  Private
exports.deleteMeal = async (req, res) => {
  try {
    const meal = await Meal.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!meal) {
      return res.status(404).json({ message: 'Meal not found' });
    }

    res.json({ message: 'Meal removed' });
  } catch (error) {
    console.error(error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Meal not found' });
    }
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get daily nutrition summary
// @route   GET /api/meals/summary/daily
// @access  Private
exports.getDailySummary = async (req, res) => {
  const { startDate, endDate } = req.query;
  
  try {
    // Default to last 7 days if no date range provided
    const defaultEndDate = new Date();
    const defaultStartDate = new Date();
    defaultStartDate.setDate(defaultStartDate.getDate() - 7);
    
    const start = startDate ? new Date(startDate) : defaultStartDate;
    const end = endDate ? new Date(endDate) : defaultEndDate;
    
    // Ensure end date is end of day
    end.setHours(23, 59, 59, 999);
    
    const summary = await Meal.getDailySummary(req.user.id, start, end);
    
    res.json({
      startDate: start,
      endDate: end,
      summary,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get meal type breakdown
// @route   GET /api/meals/summary/meal-types
// @access  Private
exports.getMealTypeBreakdown = async (req, res) => {
  const { startDate, endDate } = req.query;
  
  try {
    // Default to last 30 days if no date range provided
    const defaultEndDate = new Date();
    const defaultStartDate = new Date();
    defaultStartDate.setDate(defaultStartDate.getDate() - 30);
    
    const start = startDate ? new Date(startDate) : defaultStartDate;
    const end = endDate ? new Date(endDate) : defaultEndDate;
    
    // Ensure end date is end of day
    end.setHours(23, 59, 59, 999);
    
    const breakdown = await Meal.getMealTypeBreakdown(req.user.id, start, end);
    
    res.json({
      startDate: start,
      endDate: end,
      breakdown,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get micronutrient summary
// @route   GET /api/meals/summary/micronutrients
// @access  Private
exports.getMicronutrientSummary = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const end = endDate ? new Date(endDate) : new Date();
    end.setHours(23, 59, 59, 999);

    const start = startDate ? new Date(startDate) : new Date(end.getTime());
    if (!startDate) {
      start.setDate(start.getDate() - 29);
    }
    start.setHours(0, 0, 0, 0);

    const meals = await Meal.find({
      user: req.user.id,
      date: { $gte: start, $lte: end },
    }).populate('items.foodItem');

    const totals = {
      vitamins: Object.fromEntries(VITAMIN_KEYS.map((key) => [key, 0])),
      minerals: Object.fromEntries(MINERAL_KEYS.map((key) => [key, 0])),
      lipids: Object.fromEntries([...LIPID_KEYS, 'cholesterol'].map((key) => [key, 0])),
      electrolytes: { sodium: 0, potassium: 0 },
    };
    totals.lipids.total = 0;

    const trackedDates = new Set();
    const foodCache = new Map();

    const computeNutrition = async (item) => {
      const nutrition = item.nutrition || {};
      const hasMicros =
        (nutrition.vitamins && Object.values(nutrition.vitamins).some((value) => value)) ||
        (nutrition.minerals && Object.values(nutrition.minerals).some((value) => value)) ||
        nutrition.sodium ||
        nutrition.potassium ||
        nutrition.cholesterol ||
        (nutrition.fat &&
          (nutrition.fat.monounsaturated || nutrition.fat.polyunsaturated || nutrition.fat.saturated || nutrition.fat.trans));

      if (hasMicros) {
        return nutrition;
      }

      if (item.foodItem && typeof item.foodItem.getNutritionForServing === 'function') {
        return item.foodItem.getNutritionForServing(item.amount, item.unit);
      }

      const foodId = item.foodItem?._id || item.foodItem;
      if (!foodId) return null;

      const cacheKey = foodId.toString();
      if (foodCache.has(cacheKey)) {
        const cached = foodCache.get(cacheKey);
        return cached
          ? cached.getNutritionForServing(item.amount, item.unit)
          : null;
      }

      const fallbackFood = await FoodItem.findById(foodId);
      if (fallbackFood) {
        foodCache.set(cacheKey, fallbackFood);
        return fallbackFood.getNutritionForServing(item.amount, item.unit);
      }

      foodCache.set(cacheKey, null);

      return null;
    };

    for (const meal of meals) {
      if (meal.date) {
        const dateKey = new Date(meal.date).toISOString().split('T')[0];
        trackedDates.add(dateKey);
      }

      for (const item of meal.items) {
        const nutrition = await computeNutrition(item);
        if (!nutrition) continue;

        if (nutrition.vitamins) {
          VITAMIN_KEYS.forEach((key) => {
            if (nutrition.vitamins[key]) {
              totals.vitamins[key] += nutrition.vitamins[key];
            }
          });
        }

        if (nutrition.minerals) {
          MINERAL_KEYS.forEach((key) => {
            if (nutrition.minerals[key]) {
              totals.minerals[key] += nutrition.minerals[key];
            }
          });
        }

        if (nutrition.fat) {
          LIPID_KEYS.forEach((key) => {
            if (nutrition.fat[key]) {
              totals.lipids[key] += nutrition.fat[key];
            }
          });
          if (nutrition.fat.total) {
            totals.lipids.total = (totals.lipids.total || 0) + nutrition.fat.total;
          }
        }

        if (nutrition.cholesterol) {
          totals.lipids.cholesterol += nutrition.cholesterol;
        }

        if (nutrition.sodium) {
          totals.electrolytes.sodium += nutrition.sodium;
        }

        if (nutrition.potassium) {
          totals.electrolytes.potassium += nutrition.potassium;
        }
      }
    }

    const daysTracked = trackedDates.size || 1;

    const summary = [];

    const pushSummary = (group, key, totalValue) => {
      const rda = MICRO_RDA[group]?.[key] || null;
      const perDay = totalValue / daysTracked;
      const percentage = rda ? parseFloat(((perDay / rda.amount) * 100).toFixed(1)) : null;

      summary.push({
        group,
        key,
        total: parseFloat(totalValue.toFixed(2)),
        perDay: parseFloat(perDay.toFixed(2)),
        rda,
        percentage,
      });
    };

    Object.entries(totals.vitamins).forEach(([key, value]) => pushSummary('vitamins', key, value));
    Object.entries(totals.minerals).forEach(([key, value]) => pushSummary('minerals', key, value));
    Object.entries(totals.lipids).forEach(([key, value]) => pushSummary('lipids', key, value));
    Object.entries(totals.electrolytes).forEach(([key, value]) => pushSummary('electrolytes', key, value));

    const deficiencyGroups = new Set(['vitamins', 'minerals']);
    const deficiencyKeys = new Set(['potassium']);
    const upperLimitKeys = new Set(['sodium', 'saturated', 'trans', 'cholesterol']);

    const deficiencies = summary.filter((item) => {
      if (item.percentage === null) return false;
      if (deficiencyGroups.has(item.group) || deficiencyKeys.has(item.key)) {
        return item.percentage < 80;
      }
      return false;
    });

    const excesses = summary.filter((item) => {
      if (item.percentage === null) return false;
      if (upperLimitKeys.has(item.key)) {
        return item.percentage > 100;
      }
      return item.percentage > 120;
    });

    res.json({
      range: {
        start,
        end,
        trackedDays: trackedDates.size,
      },
      totals,
      summary,
      deficiencies,
      excesses,
    });
  } catch (error) {
    console.error('Micronutrient summary error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
