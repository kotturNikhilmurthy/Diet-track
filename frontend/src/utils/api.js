import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
  // Default to backend port 5000 (server.js uses PORT 5000 by default)
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API calls
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/me', data),
  deleteAccount: () => api.delete('/auth/me'),
};

// User API calls
export const userAPI = {
  getProfile: () => api.get('/users/me'),
  updateProfile: (data) => api.put('/users/me', data),
  getHealthConditions: () => api.get('/users/health-conditions'),
  getRecommendations: () => api.get('/users/recommendations'),
  getAllUsers: (params) => api.get('/users', { params }),
  sendDietPlan: () => api.post('/users/send-diet-plan'),
};

// Meal API calls
export const mealAPI = {
  createMeal: (data) => api.post('/meals', data),
  getMeals: (params) => api.get('/meals', { params }),
  getMealById: (id) => api.get(`/meals/${id}`),
  updateMeal: (id, data) => api.put(`/meals/${id}`, data),
  deleteMeal: (id) => api.delete(`/meals/${id}`),
  getDailySummary: (params) => api.get('/meals/summary/daily', { params }),
  getMealTypeBreakdown: (params) => api.get('/meals/summary/meal-types', { params }),
  getMicronutrientSummary: (params) => api.get('/meals/summary/micronutrients', { params }),
};

// Food API calls
export const foodAPI = {
  getFoods: (params) => api.get('/foods', { params }),
  getFoodById: (id) => api.get(`/foods/${id}`),
  searchFoods: (query) => api.get(`/foods/search/${query}`),
  getFoodCategories: () => api.get('/foods/categories'),
  getFoodsByCategory: (category) => api.get(`/foods/category/${category}`),
  getNutritionForFoods: (data) => api.post('/foods/nutrition', data),
  createFood: (data) => api.post('/foods', data),
  updateFood: (id, data) => api.put(`/foods/${id}`, data),
  deleteFood: (id) => api.delete(`/foods/${id}`),
};

// Chat assistant API
export const chatAPI = {
  sendMessage: (payload) => api.post('/chat', payload),
};

export default api;
