const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const {
  createFoodItem,
  getFoodItems,
  getFoodItemById,
  updateFoodItem,
  deleteFoodItem,
  getFoodCategories,
  getFoodsByCategory,
  searchFoodItems,
  getNutritionForFoods,
} = require('../controllers/food.controller');
const { protect, admin } = require('../middleware/auth.middleware');

// Public/Protected routes

// @route   GET /api/foods
// @desc    Get all food items
// @access  Private
router.get('/', protect, getFoodItems);

// @route   GET /api/foods/categories
// @desc    Get all food categories
// @access  Private
router.get('/categories', protect, getFoodCategories);

// @route   GET /api/foods/search/:query
// @desc    Search food items
// @access  Private
router.get('/search/:query', protect, searchFoodItems);

// @route   GET /api/foods/category/:category
// @desc    Get food items by category
// @access  Private
router.get('/category/:category', protect, getFoodsByCategory);

// @route   POST /api/foods/nutrition
// @desc    Get nutrition for multiple foods
// @access  Private
router.post(
  '/nutrition',
  protect,
  [
    body('foods', 'Foods array is required').isArray({ min: 1 }),
    body('foods.*.foodItemId', 'Food item ID is required').notEmpty(),
    body('foods.*.amount', 'Amount is required').isNumeric(),
    body('foods.*.unit', 'Unit is required').notEmpty(),
  ],
  getNutritionForFoods
);

// @route   GET /api/foods/:id
// @desc    Get food item by ID
// @access  Private
router.get('/:id', protect, getFoodItemById);

// Admin routes

// @route   POST /api/foods
// @desc    Create a new food item
// @access  Private/Admin
router.post(
  '/',
  protect,
  admin,
  [
    body('name', 'Name is required').trim().notEmpty(),
    body('category', 'Category is required').isIn([
      'grains',
      'proteins',
      'vegetables',
      'fruits',
      'dairy',
      'fats',
      'sweets',
      'beverages',
      'other',
    ]),
    body('servingSize.amount', 'Serving size amount is required').isNumeric(),
    body('servingSize.unit', 'Serving size unit is required').notEmpty(),
    body('nutrition.calories', 'Calories are required').isNumeric(),
    body('nutrition.protein', 'Protein is required').isNumeric(),
    body('nutrition.carbs.total', 'Total carbs are required').isNumeric(),
    body('nutrition.fat.total', 'Total fat is required').isNumeric(),
  ],
  createFoodItem
);

// @route   PUT /api/foods/:id
// @desc    Update a food item
// @access  Private/Admin
router.put('/:id', protect, admin, updateFoodItem);

// @route   DELETE /api/foods/:id
// @desc    Delete a food item
// @access  Private/Admin
router.delete('/:id', protect, admin, deleteFoodItem);

module.exports = router;
