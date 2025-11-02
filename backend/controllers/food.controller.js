const FoodItem = require('../models/foodItem.model');
const { validationResult } = require('express-validator');

// @desc    Create a new food item
// @route   POST /api/foods
// @access  Private/Admin
exports.createFoodItem = async (req, res) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    // Check if food item with the same name already exists
    const existingFood = await FoodItem.findOne({ name: req.body.name });
    if (existingFood) {
      return res.status(400).json({ message: 'Food item with this name already exists' });
    }

    // Create new food item
    const foodItem = new FoodItem({
      ...req.body,
      addedBy: req.user.id,
      lastUpdatedBy: req.user.id,
    });

    // Save food item to database
    await foodItem.save();

    res.status(201).json(foodItem);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get all food items
// @route   GET /api/foods
// @access  Private
exports.getFoodItems = async (req, res) => {
  const { 
    search, 
    category, 
    suitableFor, 
    notSuitableFor, 
    isCommon, 
    isVerified, 
    page = 1, 
    limit = 20 
  } = req.query;

  try {
    const query = {};

    // Text search
    if (search) {
      query.$text = { $search: search };
    }

    // Filter by category
    if (category) {
      query.category = category;
    }

    // Filter by suitable for condition
    if (suitableFor) {
      query['suitableFor.condition'] = suitableFor;
    }

    // Filter by not suitable for condition
    if (notSuitableFor) {
      query['notSuitableFor.condition'] = notSuitableFor;
    }

    // Filter by isCommon flag
    if (isCommon !== undefined) {
      query.isCommon = isCommon === 'true';
    }

    // Filter by isVerified flag
    if (isVerified !== undefined) {
      query.isVerified = isVerified === 'true';
    }

    // Pagination
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    // Get total count for pagination
    const total = await FoodItem.countDocuments(query);

    // Get food items with pagination
    let foodItems = await FoodItem.find(query)
      .sort({ name: 1 })
      .skip(skip)
      .limit(limitNum);

    // If no results with text search, try a case-insensitive regex search
    if (foodItems.length === 0 && search) {
      const regex = new RegExp(search, 'i');
      foodItems = await FoodItem.find({ name: regex })
        .sort({ name: 1 })
        .limit(limitNum);
    }

    res.json({
      foodItems,
      page: pageNum,
      pages: Math.ceil(total / limitNum),
      total,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get food item by ID
// @route   GET /api/foods/:id
// @access  Private
exports.getFoodItemById = async (req, res) => {
  try {
    const foodItem = await FoodItem.findById(req.params.id);

    if (!foodItem) {
      return res.status(404).json({ message: 'Food item not found' });
    }

    res.json(foodItem);
  } catch (error) {
    console.error(error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Food item not found' });
    }
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update a food item
// @route   PUT /api/foods/:id
// @access  Private/Admin
exports.updateFoodItem = async (req, res) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const updates = { ...req.body, lastUpdatedBy: req.user.id };
    
    const foodItem = await FoodItem.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!foodItem) {
      return res.status(404).json({ message: 'Food item not found' });
    }

    res.json(foodItem);
  } catch (error) {
    console.error(error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Food item not found' });
    }
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Food item with this name already exists' });
    }
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete a food item
// @route   DELETE /api/foods/:id
// @access  Private/Admin
exports.deleteFoodItem = async (req, res) => {
  try {
    const foodItem = await FoodItem.findByIdAndDelete(req.params.id);

    if (!foodItem) {
      return res.status(404).json({ message: 'Food item not found' });
    }

    // TODO: Handle references to this food item in meals

    res.json({ message: 'Food item removed' });
  } catch (error) {
    console.error(error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Food item not found' });
    }
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get food categories
// @route   GET /api/foods/categories
// @access  Private
exports.getFoodCategories = async (req, res) => {
  try {
    const categories = await FoodItem.distinct('category');
    res.json(categories);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get food items by category
// @route   GET /api/foods/category/:category
// @access  Private
exports.getFoodsByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const { limit = 50 } = req.query;

    const foodItems = await FoodItem.find({ category })
      .sort({ name: 1 })
      .limit(parseInt(limit, 10));

    res.json(foodItems);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Search food items by name
// @route   GET /api/foods/search/:query
// @access  Private
exports.searchFoodItems = async (req, res) => {
  try {
    const { query } = req.params;
    const { limit = 10 } = req.query;

    // First try text search
    let foodItems = await FoodItem.find(
      { $text: { $search: query } },
      { score: { $meta: 'textScore' } }
    )
      .sort({ score: { $meta: 'textScore' } })
      .limit(parseInt(limit, 10));

    // If no results with text search, try a case-insensitive regex search
    if (foodItems.length === 0) {
      const regex = new RegExp(query, 'i');
      foodItems = await FoodItem.find({ name: regex })
        .sort({ name: 1 })
        .limit(parseInt(limit, 10));
    }

    res.json(foodItems);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get nutrition information for multiple food items
// @route   POST /api/foods/nutrition
// @access  Private
exports.getNutritionForFoods = async (req, res) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { foods } = req.body; // Array of { foodItemId, amount, unit }

  try {
    const nutritionInfo = [];
    let totalNutrition = {
      calories: 0,
      protein: 0,
      carbs: { total: 0, fiber: 0, sugar: 0 },
      fat: { total: 0, saturated: 0, trans: 0 },
    };

    for (const item of foods) {
      const foodItem = await FoodItem.findById(item.foodItemId);
      
      if (!foodItem) {
        return res.status(404).json({ 
          message: `Food item with ID ${item.foodItemId} not found` 
        });
      }

      // Calculate nutrition for the specified amount
      const nutrition = foodItem.getNutritionForServing(item.amount, item.unit);
      
      // Add to nutrition info array
      nutritionInfo.push({
        foodItem: foodItem._id,
        name: foodItem.name,
        amount: item.amount,
        unit: item.unit,
        nutrition,
      });

      // Add to total nutrition
      totalNutrition.calories += nutrition.calories || 0;
      totalNutrition.protein += nutrition.protein || 0;
      
      if (nutrition.carbs) {
        totalNutrition.carbs.total += nutrition.carbs.total || 0;
        totalNutrition.carbs.fiber += nutrition.carbs.fiber || 0;
        totalNutrition.carbs.sugar += nutrition.carbs.sugar || 0;
      }
      
      if (nutrition.fat) {
        totalNutrition.fat.total += nutrition.fat.total || 0;
        totalNutrition.fat.saturated += nutrition.fat.saturated || 0;
        totalNutrition.fat.trans += nutrition.fat.trans || 0;
      }
    }

    res.json({
      items: nutritionInfo,
      total: totalNutrition,
    });
  } catch (error) {
    console.error(error);
    if (error.kind === 'ObjectId') {
      return res.status(400).json({ message: 'Invalid food item ID' });
    }
    res.status(500).json({ message: 'Server error' });
  }
};
