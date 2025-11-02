const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const {
  createMeal,
  getMeals,
  getMealById,
  updateMeal,
  deleteMeal,
  getDailySummary,
  getMealTypeBreakdown,
  getMicronutrientSummary,
} = require('../controllers/meal.controller');
const { protect } = require('../middleware/auth.middleware');

// All routes are protected
router.use(protect);

// @route   POST /api/meals
// @desc    Create a new meal
// @access  Private
router.post(
  '/',
  [
    body('mealType', 'Meal type is required').isIn(['breakfast', 'lunch', 'dinner', 'snack', 'other']),
    body('items', 'Items array is required').isArray({ min: 1 }),
    body('items.*.foodItem', 'Food item ID is required').notEmpty(),
    body('items.*.amount', 'Amount is required').isNumeric(),
    body('items.*.unit', 'Unit is required').notEmpty(),
  ],
  createMeal
);

// @route   GET /api/meals
// @desc    Get all meals for logged-in user
// @access  Private
router.get('/', getMeals);

// @route   GET /api/meals/summary/daily
// @desc    Get daily nutrition summary
// @access  Private
router.get('/summary/daily', getDailySummary);

// @route   GET /api/meals/summary/meal-types
// @desc    Get meal type breakdown
// @access  Private
router.get('/summary/meal-types', getMealTypeBreakdown);

// @route   GET /api/meals/summary/micronutrients
// @desc    Get micronutrient summary
// @access  Private
router.get('/summary/micronutrients', getMicronutrientSummary);

// @route   GET /api/meals/:id
// @desc    Get meal by ID
// @access  Private
router.get('/:id', getMealById);

// @route   PUT /api/meals/:id
// @desc    Update a meal
// @access  Private
router.put('/:id', updateMeal);

// @route   DELETE /api/meals/:id
// @desc    Delete a meal
// @access  Private
router.delete('/:id', deleteMeal);

module.exports = router;
