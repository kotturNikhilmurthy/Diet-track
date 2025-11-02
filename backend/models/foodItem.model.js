const mongoose = require('mongoose');

const foodItemSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a name for the food item'],
      trim: true,
      unique: true,
    },
    description: {
      type: String,
      trim: true,
    },
    category: {
      type: String,
      enum: [
        'grains',
        'proteins',
        'vegetables',
        'fruits',
        'dairy',
        'fats',
        'sweets',
        'beverages',
        'other',
      ],
      required: [true, 'Please provide a category for the food item'],
    },
    servingSize: {
      amount: {
        type: Number,
        required: [true, 'Please provide a serving size amount'],
        min: [0, 'Serving size must be a positive number'],
      },
      unit: {
        type: String,
        required: [true, 'Please provide a serving size unit'],
        enum: ['g', 'ml', 'tsp', 'tbsp', 'cup', 'piece', 'slice', 'small', 'medium', 'large'],
      },
      description: {
        type: String,
        trim: true,
      },
    },
    nutrition: {
      calories: {
        type: Number,
        required: [true, 'Please provide the number of calories'],
        min: [0, 'Calories cannot be negative'],
      },
      protein: {
        type: Number,
        required: [true, 'Please provide the protein content'],
        min: [0, 'Protein cannot be negative'],
      },
      carbs: {
        total: {
          type: Number,
          required: [true, 'Please provide the total carbohydrate content'],
          min: [0, 'Carbohydrates cannot be negative'],
        },
        fiber: {
          type: Number,
          default: 0,
          min: [0, 'Fiber cannot be negative'],
        },
        sugar: {
          type: Number,
          default: 0,
          min: [0, 'Sugar cannot be negative'],
        },
      },
      fat: {
        total: {
          type: Number,
          required: [true, 'Please provide the total fat content'],
          min: [0, 'Fat cannot be negative'],
        },
        saturated: {
          type: Number,
          default: 0,
          min: [0, 'Saturated fat cannot be negative'],
        },
        trans: {
          type: Number,
          default: 0,
          min: [0, 'Trans fat cannot be negative'],
        },
        monounsaturated: {
          type: Number,
          default: 0,
          min: [0, 'Monounsaturated fat cannot be negative'],
        },
        polyunsaturated: {
          type: Number,
          default: 0,
          min: [0, 'Polyunsaturated fat cannot be negative'],
        },
      },
      cholesterol: {
        type: Number,
        default: 0,
        min: [0, 'Cholesterol cannot be negative'],
      },
      sodium: {
        type: Number,
        default: 0,
        min: [0, 'Sodium cannot be negative'],
      },
      potassium: {
        type: Number,
        default: 0,
        min: [0, 'Potassium cannot be negative'],
      },
      vitamins: {
        a: { type: Number, default: 0, min: 0 },
        c: { type: Number, default: 0, min: 0 },
        d: { type: Number, default: 0, min: 0 },
        e: { type: Number, default: 0, min: 0 },
        k: { type: Number, default: 0, min: 0 },
        b1: { type: Number, default: 0, min: 0 }, // Thiamin
        b2: { type: Number, default: 0, min: 0 }, // Riboflavin
        b3: { type: Number, default: 0, min: 0 }, // Niacin
        b6: { type: Number, default: 0, min: 0 },
        b12: { type: Number, default: 0, min: 0 },
        folate: { type: Number, default: 0, min: 0 },
      },
      minerals: {
        calcium: { type: Number, default: 0, min: 0 },
        iron: { type: Number, default: 0, min: 0 },
        magnesium: { type: Number, default: 0, min: 0 },
        phosphorus: { type: Number, default: 0, min: 0 },
        zinc: { type: Number, default: 0, min: 0 },
        copper: { type: Number, default: 0, min: 0 },
        manganese: { type: Number, default: 0, min: 0 },
        selenium: { type: Number, default: 0, min: 0 },
      },
    },
    suitableFor: [
      {
        condition: {
          type: String,
          enum: [
            'diabetes',
            'high_blood_pressure',
            'high_cholesterol',
            'obesity',
            'pcos_pcod',
            'thyroid_disorders',
            'heart_disease',
            'kidney_issues',
            'pregnancy_nursing',
            'celiac_gluten_free',
            'lactose_intolerance',
            'vegetarian',
            'vegan',
            'keto',
            'paleo',
            'mediterranean',
            'low_fodmap',
          ],
        },
        notes: String,
      },
    ],
    notSuitableFor: [
      {
        condition: {
          type: String,
          enum: [
            'diabetes',
            'high_blood_pressure',
            'high_cholesterol',
            'obesity',
            'pcos_pcod',
            'thyroid_disorders',
            'heart_disease',
            'kidney_issues',
            'pregnancy_nursing',
            'celiac_gluten_free',
            'lactose_intolerance',
            'vegetarian',
            'vegan',
            'keto',
            'paleo',
            'mediterranean',
            'low_fodmap',
          ],
        },
        reason: String,
      },
    ],
    isCommon: {
      type: Boolean,
      default: false,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    lastUpdatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes for better query performance
foodItemSchema.index({ name: 'text', description: 'text' });
foodItemSchema.index({ category: 1 });
foodItemSchema.index({ 'suitableFor.condition': 1 });
foodItemSchema.index({ 'notSuitableFor.condition': 1 });

// Virtual for common name variations (e.g., "eggplant" and "aubergine")
foodItemSchema.virtual('aliases', {
  ref: 'FoodAlias',
  localField: '_id',
  foreignField: 'foodItem',
});

// Method to check if food is suitable for a specific condition
foodItemSchema.methods.isSuitableFor = function (condition) {
  // First check notSuitableFor (takes precedence)
  const notSuitable = this.notSuitableFor.some(
    (item) => item.condition === condition
  );
  if (notSuitable) return false;

  // Then check suitableFor
  return this.suitableFor.some((item) => item.condition === condition);
};

// Method to get nutrition info for a specific serving size
foodItemSchema.methods.getNutritionForServing = function (amount, unit) {
  // If serving size matches, return existing nutrition
  if (amount === this.servingSize.amount && unit === this.servingSize.unit) {
    return this.nutrition;
  }

  // Otherwise, calculate based on ratio
  let ratio = 1;
  
  // Simple ratio calculation - this could be enhanced with more complex logic
  // for converting between different units (e.g., cups to grams)
  if (unit === this.servingSize.unit) {
    ratio = amount / this.servingSize.amount;
  } else {
    // For now, just use the amount as is if units differ
    // In a real app, you'd want to implement proper unit conversion
    ratio = amount / this.servingSize.amount;
  }

  // Create a deep copy of the nutrition object
  const scaledNutrition = JSON.parse(JSON.stringify(this.nutrition));

  // Scale all numeric values in the nutrition object
  const scaleNestedObject = (obj) => {
    for (const key in obj) {
      if (typeof obj[key] === 'number') {
        obj[key] = parseFloat((obj[key] * ratio).toFixed(2));
      } else if (typeof obj[key] === 'object' && obj[key] !== null) {
        scaleNestedObject(obj[key]);
      }
    }
  };

  scaleNestedObject(scaledNutrition);
  return scaledNutrition;
};

module.exports = mongoose.model('FoodItem', foodItemSchema);
