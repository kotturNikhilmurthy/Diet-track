import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { mealAPI, foodAPI } from '../utils/api';
import { getTodayDate, formatDateReadable, getMealTypeLabel, getMealTypeColor, debounce } from '../utils/helpers';

const MealTrackerPage = () => {
  const [meals, setMeals] = useState([]);
  const [selectedDate, setSelectedDate] = useState(getTodayDate());
  const [showAddMeal, setShowAddMeal] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Add meal form state
  const [mealForm, setMealForm] = useState({
    mealType: 'breakfast',
    items: [],
    notes: '',
  });
  
  // Food search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    fetchMeals();
  }, [selectedDate]);

  const fetchMeals = async () => {
    try {
      setLoading(true);
      const response = await mealAPI.getMeals({
        startDate: selectedDate,
        endDate: selectedDate,
      });
      setMeals(response.data.meals || []);
    } catch (error) {
      console.error('Error fetching meals:', error);
    } finally {
      setLoading(false);
    }
  };

  const searchFoods = debounce(async (query) => {
    if (!query || query.length < 2) {
      setSearchResults([]);
      return;
    }

    try {
      setSearching(true);
      const response = await foodAPI.searchFoods(query);
      setSearchResults(response.data);
    } catch (error) {
      console.error('Error searching foods:', error);
    } finally {
      setSearching(false);
    }
  }, 300);

  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    searchFoods(query);
  };

  const addFoodToMeal = (food) => {
    const newItem = {
      foodItem: food._id,
      name: food.name,
      amount: food.servingSize.amount,
      unit: food.servingSize.unit,
      nutrition: {
        calories: food.nutrition.calories,
        protein: food.nutrition.protein,
        carbs: food.nutrition.carbs,
        fat: food.nutrition.fat,
      },
    };

    setMealForm({
      ...mealForm,
      items: [...mealForm.items, newItem],
    });
    setSearchQuery('');
    setSearchResults([]);
  };

  const removeFoodFromMeal = (index) => {
    setMealForm({
      ...mealForm,
      items: mealForm.items.filter((_, i) => i !== index),
    });
  };

  const updateFoodAmount = (index, amount) => {
    const updatedItems = [...mealForm.items];
    const item = updatedItems[index];
    const ratio = amount / item.amount;
    
    updatedItems[index] = {
      ...item,
      amount: parseFloat(amount),
      nutrition: {
        calories: Math.round(item.nutrition.calories * ratio),
        protein: Math.round(item.nutrition.protein * ratio * 10) / 10,
        carbs: {
          total: Math.round(item.nutrition.carbs.total * ratio * 10) / 10,
          fiber: Math.round((item.nutrition.carbs.fiber || 0) * ratio * 10) / 10,
          sugar: Math.round((item.nutrition.carbs.sugar || 0) * ratio * 10) / 10,
        },
        fat: {
          total: Math.round(item.nutrition.fat.total * ratio * 10) / 10,
          saturated: Math.round((item.nutrition.fat.saturated || 0) * ratio * 10) / 10,
          trans: Math.round((item.nutrition.fat.trans || 0) * ratio * 10) / 10,
        },
      },
    };

    setMealForm({
      ...mealForm,
      items: updatedItems,
    });
  };

  const calculateTotals = () => {
    return mealForm.items.reduce(
      (acc, item) => ({
        calories: acc.calories + (item.nutrition.calories || 0),
        protein: acc.protein + (item.nutrition.protein || 0),
        carbs: acc.carbs + (item.nutrition.carbs?.total || 0),
        fat: acc.fat + (item.nutrition.fat?.total || 0),
      }),
      { calories: 0, protein: 0, carbs: 0, fat: 0 }
    );
  };

  const handleSubmitMeal = async (e) => {
    e.preventDefault();
    
    if (mealForm.items.length === 0) {
      alert('Please add at least one food item');
      return;
    }

    try {
      setLoading(true);
      await mealAPI.createMeal({
        ...mealForm,
        date: selectedDate,
      });
      
      setShowAddMeal(false);
      setMealForm({
        mealType: 'breakfast',
        items: [],
        notes: '',
      });
      fetchMeals();
    } catch (error) {
      console.error('Error creating meal:', error);
      alert('Failed to add meal');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteMeal = async (mealId) => {
    if (!window.confirm('Are you sure you want to delete this meal?')) {
      return;
    }

    try {
      await mealAPI.deleteMeal(mealId);
      fetchMeals();
    } catch (error) {
      console.error('Error deleting meal:', error);
      alert('Failed to delete meal');
    }
  };

  const totals = calculateTotals();
  const dailyTotals = meals.reduce(
    (acc, meal) => ({
      calories: acc.calories + (meal.totalNutrition?.calories || 0),
      protein: acc.protein + (meal.totalNutrition?.protein || 0),
      carbs: acc.carbs + (meal.totalNutrition?.carbs?.total || 0),
      fat: acc.fat + (meal.totalNutrition?.fat?.total || 0),
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Track Your Meals</h1>
          <button
            onClick={() => setShowAddMeal(true)}
            className="btn-primary"
          >
            + Add Meal
          </button>
        </div>

        {/* Date Selector */}
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Select Date
              </label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                max={getTodayDate()}
                className="input-field"
              />
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">Viewing meals for</p>
              <p className="text-lg font-semibold text-gray-900">
                {formatDateReadable(selectedDate)}
              </p>
            </div>
          </div>
        </div>

        {/* Daily Summary */}
        <div className="grid md:grid-cols-4 gap-4">
          <div className="card text-center">
            <p className="text-sm text-gray-600 mb-1">Calories</p>
            <p className="text-3xl font-bold text-primary-600">{Math.round(dailyTotals.calories)}</p>
          </div>
          <div className="card text-center">
            <p className="text-sm text-gray-600 mb-1">Protein</p>
            <p className="text-3xl font-bold text-blue-600">{Math.round(dailyTotals.protein)}g</p>
          </div>
          <div className="card text-center">
            <p className="text-sm text-gray-600 mb-1">Carbs</p>
            <p className="text-3xl font-bold text-green-600">{Math.round(dailyTotals.carbs)}g</p>
          </div>
          <div className="card text-center">
            <p className="text-sm text-gray-600 mb-1">Fat</p>
            <p className="text-3xl font-bold text-orange-600">{Math.round(dailyTotals.fat)}g</p>
          </div>
        </div>

        {/* Meals List */}
        <div className="space-y-4">
          {loading && meals.length === 0 ? (
            <div className="card text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            </div>
          ) : meals.length === 0 ? (
            <div className="card text-center py-12">
              <p className="text-gray-600 mb-4">No meals logged for this date</p>
              <button onClick={() => setShowAddMeal(true)} className="btn-primary">
                Add Your First Meal
              </button>
            </div>
          ) : (
            meals.map((meal) => (
              <div key={meal._id} className="card">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getMealTypeColor(meal.mealType)}`}>
                      {getMealTypeLabel(meal.mealType)}
                    </span>
                    {meal.name && <p className="text-lg font-semibold mt-2">{meal.name}</p>}
                  </div>
                  <button
                    onClick={() => handleDeleteMeal(meal._id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>

                <div className="space-y-2">
                  {meal.items.map((item, index) => (
                    <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100">
                      <div>
                        <p className="font-medium">{item.name}</p>
                        <p className="text-sm text-gray-600">
                          {item.amount} {item.unit}
                        </p>
                      </div>
                      <div className="text-right text-sm">
                        <p>{Math.round(item.nutrition.calories)} cal</p>
                        <p className="text-gray-600">
                          P: {Math.round(item.nutrition.protein)}g | 
                          C: {Math.round(item.nutrition.carbs?.total || 0)}g | 
                          F: {Math.round(item.nutrition.fat?.total || 0)}g
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex justify-between font-semibold">
                    <span>Total:</span>
                    <span>
                      {Math.round(meal.totalNutrition.calories)} cal | 
                      P: {Math.round(meal.totalNutrition.protein)}g | 
                      C: {Math.round(meal.totalNutrition.carbs?.total || 0)}g | 
                      F: {Math.round(meal.totalNutrition.fat?.total || 0)}g
                    </span>
                  </div>
                </div>

                {meal.notes && (
                  <div className="mt-3 text-sm text-gray-600 italic">
                    Note: {meal.notes}
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Add Meal Modal */}
        {showAddMeal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold">Add New Meal</h2>
                  <button
                    onClick={() => setShowAddMeal(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <form onSubmit={handleSubmitMeal} className="space-y-6">
                  {/* Meal Type */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Meal Type
                    </label>
                    <select
                      value={mealForm.mealType}
                      onChange={(e) => setMealForm({ ...mealForm, mealType: e.target.value })}
                      className="input-field"
                      required
                    >
                      <option value="breakfast">Breakfast</option>
                      <option value="lunch">Lunch</option>
                      <option value="dinner">Dinner</option>
                      <option value="snack">Snack</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  {/* Food Search */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Search Food Items
                    </label>
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={handleSearchChange}
                      placeholder="Search for foods (e.g., rice, chicken, apple)..."
                      className="input-field"
                    />
                    
                    {searching && (
                      <p className="text-sm text-gray-500 mt-2">Searching...</p>
                    )}
                    
                    {searchResults.length > 0 && (
                      <div className="mt-2 border border-gray-300 rounded-lg max-h-60 overflow-y-auto">
                        {searchResults.map((food) => (
                          <button
                            key={food._id}
                            type="button"
                            onClick={() => addFoodToMeal(food)}
                            className="w-full text-left px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                          >
                            <p className="font-medium">{food.name}</p>
                            <p className="text-sm text-gray-600">
                              {food.servingSize.amount} {food.servingSize.unit} - {food.nutrition.calories} cal
                            </p>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Selected Foods */}
                  {mealForm.items.length > 0 && (
                    <div>
                      <h3 className="font-semibold mb-3">Selected Foods</h3>
                      <div className="space-y-3">
                        {mealForm.items.map((item, index) => (
                          <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                            <div className="flex-1">
                              <p className="font-medium">{item.name}</p>
                              <p className="text-sm text-gray-600">
                                {Math.round(item.nutrition.calories)} cal
                              </p>
                            </div>
                            <input
                              type="number"
                              value={item.amount}
                              onChange={(e) => updateFoodAmount(index, e.target.value)}
                              className="input-field w-24"
                              step="0.1"
                              min="0.1"
                            />
                            <span className="text-sm text-gray-600 w-12">{item.unit}</span>
                            <button
                              type="button"
                              onClick={() => removeFoodFromMeal(index)}
                              className="text-red-600 hover:text-red-800"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </div>
                        ))}
                      </div>

                      {/* Totals */}
                      <div className="mt-4 p-4 bg-primary-50 rounded-lg">
                        <h4 className="font-semibold mb-2">Meal Totals</h4>
                        <div className="grid grid-cols-4 gap-4 text-center">
                          <div>
                            <p className="text-sm text-gray-600">Calories</p>
                            <p className="text-lg font-bold text-primary-600">{Math.round(totals.calories)}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Protein</p>
                            <p className="text-lg font-bold text-blue-600">{Math.round(totals.protein)}g</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Carbs</p>
                            <p className="text-lg font-bold text-green-600">{Math.round(totals.carbs)}g</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Fat</p>
                            <p className="text-lg font-bold text-orange-600">{Math.round(totals.fat)}g</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Notes */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Notes (Optional)
                    </label>
                    <textarea
                      value={mealForm.notes}
                      onChange={(e) => setMealForm({ ...mealForm, notes: e.target.value })}
                      className="input-field"
                      rows="3"
                      placeholder="Add any notes about this meal..."
                    />
                  </div>

                  {/* Submit Buttons */}
                  <div className="flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setShowAddMeal(false)}
                      className="btn-secondary"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={loading || mealForm.items.length === 0}
                      className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? 'Adding...' : 'Add Meal'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default MealTrackerPage;
