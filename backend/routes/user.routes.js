const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/auth.middleware');
const User = require('../models/user.model');
const { sendDietPlanEmail } = require('../services/email.service');

// @route   GET /api/users/me
// @desc    Get current user profile (alias for /api/auth/me)
// @access  Private
router.get('/', protect, admin, async (req, res) => {
  try {
    const { search, page = 1, limit = 20 } = req.query;
    const pageNumber = Math.max(parseInt(page, 10) || 1, 1);
    const pageSize = Math.min(Math.max(parseInt(limit, 10) || 20, 1), 100);

    // Only show users who have actually logged in (have lastLogin timestamp)
    const query = {
      lastLogin: { $exists: true, $ne: null },
    };

    if (search) {
      const pattern = new RegExp(search.trim(), 'i');
      query.$or = [{ name: pattern }, { email: pattern }];
    }

    const [users, total] = await Promise.all([
      User.find(query)
        .select('-password')
        .sort({ lastLogin: -1 }) // Sort by most recent login first
        .skip((pageNumber - 1) * pageSize)
        .limit(pageSize),
      User.countDocuments(query),
    ]);

    const enrichedUsers = users.map((userDoc) => {
      const user = userDoc.toObject();
      return {
        ...user,
        bmi: userDoc.calculateBMI(),
        bmiCategory: userDoc.getBMICategory(),
        dailyCalories: userDoc.calculateDailyCalories(),
        macros: userDoc.calculateMacros(),
      };
    });

    res.json({
      users: enrichedUsers,
      total,
      page: pageNumber,
      pages: Math.ceil(total / pageSize) || 1,
    });
  } catch (error) {
    console.error('Error fetching users for admin:', error);
    res.status(500).json({ message: 'Failed to load users' });
  }
});

router.get('/me', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Calculate BMI and other metrics
    const bmi = user.calculateBMI();
    const bmiCategory = user.getBMICategory();
    const dailyCalories = user.calculateDailyCalories();
    const macros = user.calculateMacros();

    res.json({
      ...user.toObject(),
      bmi,
      bmiCategory,
      dailyCalories,
      macros,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/users/me
// @desc    Update current user profile
// @access  Private
router.put('/me', protect, async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = [
    'name',
    'age',
    'weight',
    'height',
    'healthConditions',
    'fitnessGoal',
    'gender',
    'activityLevel',
    'location',
  ];
  
  const isValidOperation = updates.every((update) =>
    allowedUpdates.includes(update)
  );

  if (!isValidOperation) {
    return res.status(400).json({ message: 'Invalid updates!' });
  }

  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update user fields
    updates.forEach((update) => {
      user[update] = req.body[update];
    });

    await user.save();

    // Remove password from response
    const userObj = user.toObject();
    delete userObj.password;

    // Recalculate metrics
    const bmi = user.calculateBMI();
    const bmiCategory = user.getBMICategory();
    const dailyCalories = user.calculateDailyCalories();
    const macros = user.calculateMacros();

    res.json({
      ...userObj,
      bmi,
      bmiCategory,
      dailyCalories,
      macros,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/users/health-conditions
// @desc    Get list of available health conditions
// @access  Private
router.get('/health-conditions', protect, (req, res) => {
  const healthConditions = [
    { value: 'diabetes', label: 'Diabetes' },
    { value: 'high_blood_pressure', label: 'High Blood Pressure' },
    { value: 'high_cholesterol', label: 'High Cholesterol' },
    { value: 'obesity', label: 'Obesity' },
    { value: 'pcos_pcod', label: 'PCOS/PCOD' },
    { value: 'thyroid_disorders', label: 'Thyroid Disorders' },
    { value: 'heart_disease', label: 'Heart Disease' },
    { value: 'kidney_issues', label: 'Kidney Issues' },
    { value: 'pregnancy_nursing', label: 'Pregnancy/Nursing' },
    { value: 'celiac_gluten_free', label: 'Celiac/Gluten-Free' },
    { value: 'lactose_intolerance', label: 'Lactose Intolerance' },
    { value: 'vegetarian', label: 'Vegetarian' },
    { value: 'vegan', label: 'Vegan' },
  ];
  
  res.json(healthConditions);
});

// @route   GET /api/users/recommendations
// @desc    Get personalized recommendations based on health conditions and goals
// @access  Private
router.get('/recommendations', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const recommendations = {
      general: [],
      dietary: [],
      exercise: [],
      warnings: [],
    };

    // General recommendations based on BMI
    const bmi = user.calculateBMI();
    const bmiCategory = user.getBMICategory();
    
    if (bmiCategory === 'Underweight') {
      recommendations.general.push('Focus on nutrient-dense foods to gain weight healthily');
      recommendations.dietary.push('Increase calorie intake with healthy fats and proteins');
    } else if (bmiCategory === 'Overweight' || bmiCategory === 'Obese') {
      recommendations.general.push('Focus on creating a sustainable calorie deficit');
      recommendations.dietary.push('Emphasize whole foods, vegetables, and lean proteins');
      recommendations.exercise.push('Combine cardio and strength training for best results');
    }

    // Recommendations based on fitness goal
    if (user.fitnessGoal === 'weight_loss') {
      recommendations.dietary.push('Maintain a moderate calorie deficit (500 cal/day)');
      recommendations.dietary.push('Prioritize protein to preserve muscle mass');
      recommendations.exercise.push('Include both cardio and resistance training');
    } else if (user.fitnessGoal === 'muscle_building') {
      recommendations.dietary.push('Consume adequate protein (2.2g per kg body weight)');
      recommendations.dietary.push('Maintain a slight calorie surplus');
      recommendations.exercise.push('Focus on progressive overload in strength training');
    } else if (user.fitnessGoal === 'weight_gain') {
      recommendations.dietary.push('Increase calorie intake gradually');
      recommendations.dietary.push('Focus on nutrient-dense, calorie-rich foods');
    }

    // Health condition-specific recommendations
    if (user.healthConditions && user.healthConditions.length > 0) {
      user.healthConditions.forEach((condition) => {
        switch (condition) {
          case 'diabetes':
            recommendations.dietary.push('Monitor carbohydrate intake and choose low-GI foods');
            recommendations.dietary.push('Avoid sugary drinks and processed foods');
            recommendations.warnings.push('Consult your doctor before making major dietary changes');
            break;
          case 'high_blood_pressure':
            recommendations.dietary.push('Reduce sodium intake (aim for <2300mg/day)');
            recommendations.dietary.push('Increase potassium-rich foods (bananas, spinach)');
            recommendations.exercise.push('Regular aerobic exercise can help lower blood pressure');
            break;
          case 'high_cholesterol':
            recommendations.dietary.push('Limit saturated and trans fats');
            recommendations.dietary.push('Increase fiber intake with whole grains and vegetables');
            recommendations.dietary.push('Include omega-3 fatty acids (fish, nuts)');
            break;
          case 'heart_disease':
            recommendations.dietary.push('Follow a heart-healthy diet (Mediterranean style)');
            recommendations.dietary.push('Limit sodium and saturated fats');
            recommendations.warnings.push('Consult your cardiologist before starting new exercise');
            break;
          case 'kidney_issues':
            recommendations.dietary.push('Monitor protein intake as advised by your doctor');
            recommendations.dietary.push('Limit sodium and potassium if recommended');
            recommendations.warnings.push('Work closely with a renal dietitian');
            break;
          case 'thyroid_disorders':
            recommendations.dietary.push('Ensure adequate iodine intake');
            recommendations.dietary.push('Consider selenium-rich foods (Brazil nuts, fish)');
            break;
          case 'pcos_pcod':
            recommendations.dietary.push('Focus on low-GI carbohydrates');
            recommendations.dietary.push('Include anti-inflammatory foods');
            recommendations.exercise.push('Regular exercise can help manage symptoms');
            break;
          case 'celiac_gluten_free':
            recommendations.dietary.push('Strictly avoid gluten-containing foods');
            recommendations.dietary.push('Choose naturally gluten-free whole foods');
            break;
          case 'lactose_intolerance':
            recommendations.dietary.push('Choose lactose-free dairy or alternatives');
            recommendations.dietary.push('Ensure adequate calcium from other sources');
            break;
          case 'vegetarian':
            recommendations.dietary.push('Ensure adequate protein from plant sources');
            recommendations.dietary.push('Monitor iron and B12 levels');
            break;
          case 'vegan':
            recommendations.dietary.push('Supplement B12 and consider vitamin D');
            recommendations.dietary.push('Include variety of protein sources (legumes, tofu, tempeh)');
            recommendations.dietary.push('Monitor iron, calcium, and omega-3 intake');
            break;
        }
      });
    }

    res.json(recommendations);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/users/send-diet-plan
// @desc    Send diet plan to user's email
// @access  Private
router.post('/send-diet-plan', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get recommendations (same logic as GET /recommendations)
    const bmi = user.calculateBMI();
    const bmiCategory = user.getBMICategory();

    const recommendations = {
      general: [],
      dietary: [],
      exercise: [],
      lifestyle: [],
    };

    // General recommendations based on BMI
    if (bmi) {
      if (bmi < 18.5) {
        recommendations.general.push('Focus on nutrient-dense foods to gain weight healthily');
        recommendations.dietary.push('Increase calorie intake with healthy fats and proteins');
      } else if (bmi > 25) {
        recommendations.general.push('Focus on creating a sustainable calorie deficit');
        recommendations.dietary.push('Emphasize whole foods, vegetables, and lean proteins');
        recommendations.exercise.push('Combine cardio and strength training for best results');
      }
    }

    // Recommendations based on fitness goal
    if (user.fitnessGoal === 'weight_loss') {
      recommendations.dietary.push('Maintain a moderate calorie deficit (500 cal/day)');
      recommendations.dietary.push('Prioritize protein to preserve muscle mass');
      recommendations.exercise.push('Include both cardio and resistance training');
    } else if (user.fitnessGoal === 'muscle_building') {
      recommendations.dietary.push('Consume adequate protein (2.2g per kg body weight)');
      recommendations.dietary.push('Maintain a slight calorie surplus');
      recommendations.exercise.push('Focus on progressive overload in strength training');
    } else if (user.fitnessGoal === 'weight_gain') {
      recommendations.dietary.push('Increase calorie intake gradually');
      recommendations.dietary.push('Focus on nutrient-dense, calorie-rich foods');
    }

    // Health condition-specific recommendations
    if (user.healthConditions && user.healthConditions.length > 0) {
      user.healthConditions.forEach((condition) => {
        switch (condition) {
          case 'diabetes':
            recommendations.dietary.push('Monitor carbohydrate intake and choose low-GI foods');
            recommendations.dietary.push('Spread meals evenly throughout the day');
            recommendations.lifestyle.push('Check blood sugar levels regularly');
            break;
          case 'high_blood_pressure':
            recommendations.dietary.push('Reduce sodium intake (less than 2300mg/day)');
            recommendations.dietary.push('Increase potassium-rich foods (bananas, spinach)');
            recommendations.lifestyle.push('Practice stress management techniques');
            break;
          case 'high_cholesterol':
            recommendations.dietary.push('Limit saturated and trans fats');
            recommendations.dietary.push('Include omega-3 rich foods (fish, flaxseeds)');
            recommendations.exercise.push('Aim for 150 minutes of moderate aerobic activity weekly');
            break;
          case 'pcos_pcod':
            recommendations.dietary.push('Choose low-glycemic index foods');
            recommendations.dietary.push('Include anti-inflammatory foods');
            recommendations.exercise.push('Regular exercise helps manage insulin resistance');
            break;
          case 'thyroid_disorders':
            recommendations.dietary.push('Ensure adequate iodine and selenium intake');
            recommendations.dietary.push('Avoid excessive consumption of goitrogenic foods');
            recommendations.lifestyle.push('Take thyroid medication consistently');
            break;
          case 'celiac_gluten_free':
            recommendations.dietary.push('Strictly avoid all gluten-containing grains');
            recommendations.dietary.push('Choose naturally gluten-free whole foods');
            recommendations.dietary.push('Read labels carefully for hidden gluten');
            break;
          case 'lactose_intolerance':
            recommendations.dietary.push('Choose lactose-free dairy alternatives');
            recommendations.dietary.push('Ensure adequate calcium from non-dairy sources');
            recommendations.dietary.push('Consider lactase supplements if needed');
            break;
          case 'vegetarian':
            recommendations.dietary.push('Ensure adequate protein from plant sources');
            recommendations.dietary.push('Monitor B12, iron, and zinc intake');
            recommendations.dietary.push('Include variety of legumes, nuts, and seeds');
            break;
          case 'vegan':
            recommendations.dietary.push('Supplement B12 and consider vitamin D');
            recommendations.dietary.push('Include variety of protein sources (legumes, tofu, tempeh)');
            recommendations.dietary.push('Monitor iron, calcium, and omega-3 intake');
            break;
        }
      });
    }

    // Prepare user profile data
    const userProfile = {
      bmi: bmi ? bmi.toFixed(1) : null,
      bmiCategory: bmiCategory,
      fitnessGoal: user.fitnessGoal,
      activityLevel: user.activityLevel,
      healthConditions: user.healthConditions,
      dailyCalories: user.calculateDailyCalories(),
      macros: user.calculateMacros(),
    };

    // Send email
    const result = await sendDietPlanEmail(
      user.email,
      user.name,
      recommendations,
      userProfile
    );

    if (result.success) {
      res.json({ 
        message: 'Diet plan sent successfully to your email!',
        email: user.email 
      });
    } else {
      res.status(500).json({ 
        message: 'Failed to send email. Please check your email configuration.',
        error: result.error 
      });
    }
  } catch (error) {
    console.error('Error sending diet plan:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
