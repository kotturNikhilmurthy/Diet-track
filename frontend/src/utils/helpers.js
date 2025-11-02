// Format date to YYYY-MM-DD
export const formatDate = (date) => {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Format date to readable string
export const formatDateReadable = (date) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

// Calculate BMI
export const calculateBMI = (weight, height, weightUnit = 'kg', heightUnit = 'cm') => {
  if (!weight || !height) return null;
  
  // Convert to kg and meters
  const weightInKg = weightUnit === 'kg' ? weight : weight * 0.453592;
  const heightInMeters = heightUnit === 'cm' ? height / 100 : height * 0.3048;
  
  const bmi = weightInKg / (heightInMeters * heightInMeters);
  return parseFloat(bmi.toFixed(1));
};

// Get BMI category
export const getBMICategory = (bmi) => {
  if (!bmi) return null;
  
  if (bmi < 18.5) return { category: 'Underweight', color: 'text-yellow-600' };
  if (bmi < 25) return { category: 'Normal weight', color: 'text-green-600' };
  if (bmi < 30) return { category: 'Overweight', color: 'text-orange-600' };
  return { category: 'Obese', color: 'text-red-600' };
};

// Format number with commas
export const formatNumber = (num) => {
  return num?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

// Round to decimal places
export const roundTo = (num, decimals = 1) => {
  return Math.round(num * Math.pow(10, decimals)) / Math.pow(10, decimals);
};

// Get health condition label
export const getHealthConditionLabel = (value) => {
  const labels = {
    diabetes: 'Diabetes',
    high_blood_pressure: 'High Blood Pressure',
    high_cholesterol: 'High Cholesterol',
    obesity: 'Obesity',
    pcos_pcod: 'PCOS/PCOD',
    thyroid_disorders: 'Thyroid Disorders',
    heart_disease: 'Heart Disease',
    kidney_issues: 'Kidney Issues',
    pregnancy_nursing: 'Pregnancy/Nursing',
    celiac_gluten_free: 'Celiac/Gluten-Free',
    lactose_intolerance: 'Lactose Intolerance',
    vegetarian: 'Vegetarian',
    vegan: 'Vegan',
  };
  return labels[value] || value;
};

// Get fitness goal label
export const getFitnessGoalLabel = (value) => {
  const labels = {
    weight_loss: 'Weight Loss',
    weight_gain: 'Weight Gain',
    muscle_building: 'Muscle Building',
    maintenance: 'Maintenance',
  };
  return labels[value] || value;
};

// Get meal type label
export const getMealTypeLabel = (value) => {
  const labels = {
    breakfast: 'Breakfast',
    lunch: 'Lunch',
    dinner: 'Dinner',
    snack: 'Snack',
    other: 'Other',
  };
  return labels[value] || value;
};

// Get meal type color
export const getMealTypeColor = (mealType) => {
  const colors = {
    breakfast: 'bg-yellow-100 text-yellow-800',
    lunch: 'bg-blue-100 text-blue-800',
    dinner: 'bg-purple-100 text-purple-800',
    snack: 'bg-green-100 text-green-800',
    other: 'bg-gray-100 text-gray-800',
  };
  return colors[mealType] || colors.other;
};

// Calculate percentage
export const calculatePercentage = (value, total) => {
  if (!total || total === 0) return 0;
  return Math.round((value / total) * 100);
};

// Get color for nutrient progress
export const getNutrientColor = (percentage) => {
  if (percentage < 50) return 'bg-red-500';
  if (percentage < 80) return 'bg-yellow-500';
  if (percentage <= 110) return 'bg-green-500';
  return 'bg-orange-500';
};

// Validate email
export const isValidEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

// Get today's date in YYYY-MM-DD format
export const getTodayDate = () => {
  return formatDate(new Date());
};

// Get date range for last N days
export const getDateRange = (days) => {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  return {
    startDate: formatDate(startDate),
    endDate: formatDate(endDate),
  };
};

// Debounce function
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

const MICRONUTRIENT_LABELS = {
  a: 'Vitamin A',
  c: 'Vitamin C',
  d: 'Vitamin D',
  e: 'Vitamin E',
  k: 'Vitamin K',
  b1: 'Vitamin B1',
  b2: 'Vitamin B2',
  b3: 'Vitamin B3',
  b6: 'Vitamin B6',
  b12: 'Vitamin B12',
  folate: 'Folate',
  calcium: 'Calcium',
  iron: 'Iron',
  magnesium: 'Magnesium',
  phosphorus: 'Phosphorus',
  zinc: 'Zinc',
  copper: 'Copper',
  manganese: 'Manganese',
  selenium: 'Selenium',
  sodium: 'Sodium',
  potassium: 'Potassium',
  saturated: 'Saturated Fat',
  trans: 'Trans Fat',
  monounsaturated: 'Monounsaturated Fat',
  polyunsaturated: 'Polyunsaturated Fat',
  cholesterol: 'Cholesterol',
  total: 'Total Fat',
};

export const getMicronutrientLabel = (key) => {
  if (!key) return '';
  return MICRONUTRIENT_LABELS[key] || key.replace(/_/g, ' ').replace(/\b\w/g, (match) => match.toUpperCase());
};
