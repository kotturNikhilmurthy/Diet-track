const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a name'],
      trim: true,
      maxlength: [50, 'Name cannot be more than 50 characters'],
    },
    email: {
      type: String,
      required: [true, 'Please provide an email'],
      unique: true,
      trim: true,
      lowercase: true,
      match: [
        /^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/,
        'Please provide a valid email',
      ],
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: [6, 'Password must be at least 6 characters long'],
      select: false,
    },
    // Optional Google OAuth id
    googleId: {
      type: String,
      index: true,
      sparse: true,
    },
    age: {
      type: Number,
      min: [12, 'Age must be at least 12'],
      max: [120, 'Age must be less than 120'],
    },
    weight: {
      value: {
        type: Number,
        min: [20, 'Weight must be at least 20 kg'],
        max: [300, 'Weight must be less than 300 kg'],
      },
      unit: {
        type: String,
        enum: ['kg', 'lbs'],
        default: 'kg',
      },
    },
    height: {
      value: {
        type: Number,
        min: [100, 'Height must be at least 100 cm'],
        max: [250, 'Height must be less than 250 cm'],
      },
      unit: {
        type: String,
        enum: ['cm', 'ft'],
        default: 'cm',
      },
    },
    healthConditions: [
      {
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
        ],
      },
    ],
    fitnessGoal: {
      type: String,
      enum: ['weight_loss', 'weight_gain', 'muscle_building', 'maintenance'],
    },
    gender: {
      type: String,
      enum: ['male', 'female', 'other', 'prefer_not_to_say'],
    },
    activityLevel: {
      type: String,
      enum: ['sedentary', 'light', 'moderate', 'active', 'very_active'],
    },
    location: {
      area: { type: String, trim: true },
      landmark: { type: String, trim: true },
      state: { type: String, trim: true },
      district: { type: String, trim: true },
    },
    dailyCalorieGoal: Number,
    dailyProteinGoal: Number,
    dailyCarbsGoal: Number,
    dailyFatGoal: Number,
    isAdmin: {
      type: Boolean,
      default: false,
    },
    lastLogin: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Constant for authorized admin email
const ADMIN_EMAIL = 'k.nikhilmurthy2005@gmail.com';

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    
    // Automatically set isAdmin to true if email matches
    if (this.email.toLowerCase() === ADMIN_EMAIL.toLowerCase()) {
      this.isAdmin = true;
    }
    
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare password
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Calculate BMI
userSchema.methods.calculateBMI = function () {
  if (!this.weight || !this.height) return null;
  
  // Convert height to meters if in cm
  const heightInMeters = this.height.unit === 'cm' 
    ? this.height.value / 100 
    : this.height.value * 0.3048; // Convert feet to meters
    
  // Convert weight to kg if in lbs
  const weightInKg = this.weight.unit === 'kg'
    ? this.weight.value
    : this.weight.value * 0.453592; // Convert lbs to kg
    
  const bmi = weightInKg / (heightInMeters * heightInMeters);
  return parseFloat(bmi.toFixed(1));
};

// Get BMI category
userSchema.methods.getBMICategory = function () {
  const bmi = this.calculateBMI();
  if (!bmi) return null;
  
  if (bmi < 18.5) return 'Underweight';
  if (bmi < 25) return 'Normal weight';
  if (bmi < 30) return 'Overweight';
  return 'Obese';
};

// Calculate daily calorie needs
userSchema.methods.calculateDailyCalories = function () {
  if (!this.weight || !this.height || !this.age || !this.gender || !this.activityLevel) return null;
  
  // Convert weight to kg if needed
  const weightInKg = this.weight.unit === 'kg' 
    ? this.weight.value 
    : this.weight.value * 0.453592;
    
  // Convert height to cm if needed
  const heightInCm = this.height.unit === 'cm' 
    ? this.height.value 
    : this.height.value * 30.48; // Convert feet to cm

  // BMR calculation using Mifflin-St Jeor Equation
  let bmr;
  if (this.gender === 'male') {
    bmr = 10 * weightInKg + 6.25 * heightInCm - 5 * this.age + 5;
  } else {
    bmr = 10 * weightInKg + 6.25 * heightInCm - 5 * this.age - 161;
  }

  // Activity multiplier
  const activityMultipliers = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    active: 1.725,
    very_active: 1.9,
  };

  let tdee = bmr * activityMultipliers[this.activityLevel];

  // Adjust based on fitness goal
  if (this.fitnessGoal === 'weight_loss') {
    tdee -= 500; // 500 calorie deficit for weight loss
  } else if (this.fitnessGoal === 'weight_gain') {
    tdee += 500; // 500 calorie surplus for weight gain
  } else if (this.fitnessGoal === 'muscle_building') {
    tdee += 250; // 250 calorie surplus for muscle building
  }
  
  // Ensure minimum calorie intake
  tdee = Math.max(tdee, 1200);
  
  return Math.round(tdee);
};

// Calculate macronutrient goals
userSchema.methods.calculateMacros = function () {
  const calories = this.dailyCalorieGoal || this.calculateDailyCalories();
  if (!calories) return null;
  
  let proteinPerKg, fatPercentage;
  
  // Set protein and fat targets based on fitness goal
  switch (this.fitnessGoal) {
    case 'weight_loss':
      proteinPerKg = 2.2; // Higher protein for weight loss to preserve muscle
      fatPercentage = 0.25; // 25% of calories from fat
      break;
    case 'muscle_building':
      proteinPerKg = 2.2; // Higher protein for muscle building
      fatPercentage = 0.25; // 25% of calories from fat
      break;
    case 'weight_gain':
      proteinPerKg = 1.8; // Slightly higher protein
      fatPercentage = 0.3; // 30% of calories from fat for extra calories
      break;
    default: // maintenance
      proteinPerKg = 1.6; // Moderate protein
      fatPercentage = 0.25; // 25% of calories from fat
  }
  
  // Convert weight to kg if needed
  const weightInKg = this.weight.unit === 'kg' 
    ? this.weight.value 
    : this.weight.value * 0.453592;
  
  // Calculate protein (4 calories per gram)
  const proteinGrams = Math.round(weightInKg * proteinPerKg);
  const proteinCalories = proteinGrams * 4;
  
  // Calculate fat (9 calories per gram)
  const fatCalories = Math.round(calories * fatPercentage);
  const fatGrams = Math.round(fatCalories / 9);
  
  // Remaining calories go to carbs (4 calories per gram)
  const remainingCalories = calories - proteinCalories - fatCalories;
  const carbsGrams = Math.round(remainingCalories / 4);
  
  return {
    protein: proteinGrams,
    carbs: carbsGrams,
    fat: fatGrams,
  };
};

// Update goals when relevant fields change
userSchema.pre('save', function (next) {
  if (this.isModified('weight') || this.isModified('height') || 
      this.isModified('age') || this.isModified('gender') || 
      this.isModified('activityLevel') || this.isModified('fitnessGoal')) {
    
    const calories = this.calculateDailyCalories();
    if (calories) {
      this.dailyCalorieGoal = calories;
      
      const macros = this.calculateMacros();
      if (macros) {
        this.dailyProteinGoal = macros.protein;
        this.dailyCarbsGoal = macros.carbs;
        this.dailyFatGoal = macros.fat;
      }
    }
  }
  next();
});

module.exports = mongoose.model('User', userSchema);
