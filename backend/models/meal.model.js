const mongoose = require('mongoose');

const mealItemSchema = new mongoose.Schema({
  foodItem: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'FoodItem',
    required: [true, 'Please provide a food item'],
  },
  name: {
    type: String,
    required: [true, 'Please provide the name of the food item'],
    trim: true,
  },
  amount: {
    type: Number,
    required: [true, 'Please provide the amount'],
    min: [0.1, 'Amount must be greater than 0'],
  },
  unit: {
    type: String,
    required: [true, 'Please provide the unit'],
  },
  nutrition: {
    calories: { type: Number, default: 0 },
    protein: { type: Number, default: 0 },
    carbs: {
      total: { type: Number, default: 0 },
      fiber: { type: Number, default: 0 },
      sugar: { type: Number, default: 0 },
      starch: { type: Number, default: 0 },
    },
    fat: {
      total: { type: Number, default: 0 },
      saturated: { type: Number, default: 0 },
      trans: { type: Number, default: 0 },
      monounsaturated: { type: Number, default: 0 },
      polyunsaturated: { type: Number, default: 0 },
    },
    cholesterol: { type: Number, default: 0 },
    sodium: { type: Number, default: 0 },
    potassium: { type: Number, default: 0 },
    vitamins: {
      a: { type: Number, default: 0 },
      c: { type: Number, default: 0 },
      d: { type: Number, default: 0 },
      e: { type: Number, default: 0 },
      k: { type: Number, default: 0 },
      b1: { type: Number, default: 0 },
      b2: { type: Number, default: 0 },
      b3: { type: Number, default: 0 },
      b6: { type: Number, default: 0 },
      b12: { type: Number, default: 0 },
      folate: { type: Number, default: 0 },
    },
    minerals: {
      calcium: { type: Number, default: 0 },
      iron: { type: Number, default: 0 },
      magnesium: { type: Number, default: 0 },
      phosphorus: { type: Number, default: 0 },
      zinc: { type: Number, default: 0 },
      copper: { type: Number, default: 0 },
      manganese: { type: Number, default: 0 },
      selenium: { type: Number, default: 0 },
    },
  },
  notes: {
    type: String,
    trim: true,
    maxlength: [200, 'Notes cannot be more than 200 characters'],
  },
});

const mealSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Please provide a user'],
      index: true,
    },
    name: {
      type: String,
      trim: true,
      maxlength: [50, 'Meal name cannot be more than 50 characters'],
    },
    mealType: {
      type: String,
      enum: ['breakfast', 'lunch', 'dinner', 'snack', 'other'],
      required: [true, 'Please provide a meal type'],
    },
    items: [mealItemSchema],
    date: {
      type: Date,
      required: [true, 'Please provide a date for the meal'],
      index: true,
    },
    totalNutrition: {
      calories: { type: Number, default: 0 },
      protein: { type: Number, default: 0 },
      carbs: {
        total: { type: Number, default: 0 },
        fiber: { type: Number, default: 0 },
        sugar: { type: Number, default: 0 },
      },
      fat: {
        total: { type: Number, default: 0 },
        saturated: { type: Number, default: 0 },
        trans: { type: Number, default: 0 },
      },
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [500, 'Notes cannot be more than 500 characters'],
    },
    isFavorite: {
      type: Boolean,
      default: false,
    },
    imageUrl: {
      type: String,
      trim: true,
    },
    isTemplate: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Calculate total nutrition when items change
mealSchema.pre('save', function (next) {
  if (this.isModified('items')) {
    this.totalNutrition = this.items.reduce(
      (totals, item) => {
        return {
          calories: totals.calories + (item.nutrition.calories || 0),
          protein: totals.protein + (item.nutrition.protein || 0),
          carbs: {
            total: totals.carbs.total + (item.nutrition.carbs?.total || 0),
            fiber: totals.carbs.fiber + (item.nutrition.carbs?.fiber || 0),
            sugar: totals.carbs.sugar + (item.nutrition.carbs?.sugar || 0),
          },
          fat: {
            total: totals.fat.total + (item.nutrition.fat?.total || 0),
            saturated: totals.fat.saturated + (item.nutrition.fat?.saturated || 0),
            trans: totals.fat.trans + (item.nutrition.fat?.trans || 0),
          },
        };
      },
      {
        calories: 0,
        protein: 0,
        carbs: { total: 0, fiber: 0, sugar: 0 },
        fat: { total: 0, saturated: 0, trans: 0 },
      }
    );
  }
  next();
});

// Indexes for better query performance
mealSchema.index({ user: 1, date: -1 });
mealSchema.index({ user: 1, mealType: 1, date: -1 });
mealSchema.index({ user: 1, isTemplate: 1 });

// Virtual for getting the date in YYYY-MM-DD format
mealSchema.virtual('dateString').get(function () {
  return this.date.toISOString().split('T')[0];
});

// Static method to get daily summary for a user
mealSchema.statics.getDailySummary = async function (userId, startDate, endDate) {
  const matchQuery = {
    user: new mongoose.Types.ObjectId(userId),
    date: { $gte: startDate, $lte: endDate },
  };

  return this.aggregate([
    { $match: matchQuery },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$date' } },
        date: { $first: '$date' },
        totalCalories: { $sum: '$totalNutrition.calories' },
        totalProtein: { $sum: '$totalNutrition.protein' },
        totalCarbs: { $sum: '$totalNutrition.carbs.total' },
        totalFat: { $sum: '$totalNutrition.fat.total' },
        meals: { $push: '$$ROOT' },
      },
    },
    { $sort: { date: -1 } },
  ]);
};

// Static method to get nutrient breakdown by meal type
mealSchema.statics.getMealTypeBreakdown = async function (userId, startDate, endDate) {
  const matchQuery = {
    user: new mongoose.Types.ObjectId(userId),
    date: { $gte: startDate, $lte: endDate },
  };

  return this.aggregate([
    { $match: matchQuery },
    {
      $group: {
        _id: '$mealType',
        totalCalories: { $sum: '$totalNutrition.calories' },
        totalProtein: { $sum: '$totalNutrition.protein' },
        totalCarbs: { $sum: '$totalNutrition.carbs.total' },
        totalFat: { $sum: '$totalNutrition.fat.total' },
        mealCount: { $sum: 1 },
      },
    },
    {
      $project: {
        _id: 0,
        mealType: '$_id',
        totalCalories: 1,
        totalProtein: 1,
        totalCarbs: 1,
        totalFat: 1,
        mealCount: 1,
      },
    },
  ]);
};

module.exports = mongoose.model('Meal', mealSchema);
