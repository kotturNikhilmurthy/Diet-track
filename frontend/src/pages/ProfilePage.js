import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { userAPI } from '../utils/api';
import { calculateBMI, getBMICategory } from '../utils/helpers';

const ProfilePage = () => {
  const { user, updateUser, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    weight: { value: '', unit: 'kg' },
    height: { value: '', unit: 'cm' },
    gender: '',
    activityLevel: '',
    fitnessGoal: '',
    healthConditions: [],
    location: { area: '', landmark: '', state: '', district: '' },
  });
  const [healthConditionsList, setHealthConditionsList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        age: user.age || '',
        weight: user.weight || { value: '', unit: 'kg' },
        height: user.height || { value: '', unit: 'cm' },
        gender: user.gender || '',
        activityLevel: user.activityLevel || '',
        fitnessGoal: user.fitnessGoal || '',
        healthConditions: user.healthConditions || [],
        location: user.location || { area: '', landmark: '', state: '', district: '' },
      });
    }
    fetchHealthConditions();
  }, [user]);

  const fetchHealthConditions = async () => {
    try {
      const response = await userAPI.getHealthConditions();
      setHealthConditionsList(response.data);
    } catch (error) {
      console.error('Error fetching health conditions:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleNestedChange = (parent, field, value) => {
    setFormData({
      ...formData,
      [parent]: {
        ...formData[parent],
        [field]: value,
      },
    });
  };

  const handleHealthConditionToggle = (condition) => {
    const currentConditions = formData.healthConditions || [];
    const isSelected = currentConditions.includes(condition);
    
    setFormData({
      ...formData,
      healthConditions: isSelected
        ? currentConditions.filter((c) => c !== condition)
        : [...currentConditions, condition],
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const result = await updateUser(formData);
      if (result.success) {
        setSuccess('Profile updated successfully!');
        await refreshUser();
        // Redirect to recommendations (recommended diet plan section)
        try {
          navigate('/recommendations#recommended-diet-plan');
        } catch (err) {
          // ignore navigation errors
        }
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  // Calculate BMI for preview
  const previewBMI = formData.weight.value && formData.height.value
    ? calculateBMI(formData.weight.value, formData.height.value, formData.weight.unit, formData.height.unit)
    : null;
  const previewBMICategory = previewBMI ? getBMICategory(previewBMI) : null;

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">My Profile</h1>

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6">
            {success}
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="card">
            <h2 className="card-header">Basic Information</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="input-field"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Age
                </label>
                <input
                  type="number"
                  name="age"
                  value={formData.age}
                  onChange={handleChange}
                  className="input-field"
                  min="12"
                  max="120"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Gender
                </label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  className="input-field"
                  required
                >
                  <option value="">Select Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                  <option value="prefer_not_to_say">Prefer not to say</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Activity Level
                </label>
                <select
                  name="activityLevel"
                  value={formData.activityLevel}
                  onChange={handleChange}
                  className="input-field"
                  required
                >
                  <option value="">Select Activity Level</option>
                  <option value="sedentary">Sedentary (little or no exercise)</option>
                  <option value="light">Light (exercise 1-3 days/week)</option>
                  <option value="moderate">Moderate (exercise 3-5 days/week)</option>
                  <option value="active">Active (exercise 6-7 days/week)</option>
                  <option value="very_active">Very Active (intense exercise daily)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Body Measurements */}
          <div className="card">
            <h2 className="card-header">Body Measurements</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Weight
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={formData.weight.value}
                    onChange={(e) => handleNestedChange('weight', 'value', e.target.value)}
                    className="input-field flex-1"
                    step="0.1"
                    min="20"
                    max="300"
                    required
                  />
                  <select
                    value={formData.weight.unit}
                    onChange={(e) => handleNestedChange('weight', 'unit', e.target.value)}
                    className="input-field w-24"
                  >
                    <option value="kg">kg</option>
                    <option value="lbs">lbs</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Height
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={formData.height.value}
                    onChange={(e) => handleNestedChange('height', 'value', e.target.value)}
                    className="input-field flex-1"
                    step="0.1"
                    min="100"
                    max="250"
                    required
                  />
                  <select
                    value={formData.height.unit}
                    onChange={(e) => handleNestedChange('height', 'unit', e.target.value)}
                    className="input-field w-24"
                  >
                    <option value="cm">cm</option>
                    <option value="ft">ft</option>
                  </select>
                </div>
              </div>
            </div>

            {/* BMI Preview */}
            {previewBMI && (
              <div className="mt-4 p-4 bg-primary-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Your BMI</p>
                    <p className="text-2xl font-bold text-primary-600">{previewBMI}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Category</p>
                    <p className={`text-lg font-semibold ${previewBMICategory?.color}`}>
                      {previewBMICategory?.category}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Location Details */}
          <div className="card">
            <h2 className="card-header">Location Details</h2>
            <p className="text-sm text-gray-600 mb-4">
              Provide your location to help tailor recommendations relevant to your area.
            </p>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Area
                </label>
                <input
                  type="text"
                  value={formData.location?.area || ''}
                  onChange={(e) => handleNestedChange('location', 'area', e.target.value)}
                  className="input-field"
                  placeholder="e.g., JP Nagar"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Landmark
                </label>
                <input
                  type="text"
                  value={formData.location?.landmark || ''}
                  onChange={(e) => handleNestedChange('location', 'landmark', e.target.value)}
                  className="input-field"
                  placeholder="Nearby notable place"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  State
                </label>
                <input
                  type="text"
                  value={formData.location?.state || ''}
                  onChange={(e) => handleNestedChange('location', 'state', e.target.value)}
                  className="input-field"
                  placeholder="e.g., Karnataka"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  District
                </label>
                <input
                  type="text"
                  value={formData.location?.district || ''}
                  onChange={(e) => handleNestedChange('location', 'district', e.target.value)}
                  className="input-field"
                  placeholder="e.g., Bengaluru Urban"
                />
              </div>
            </div>
          </div>

          {/* Fitness Goal */}
          <div className="card">
            <h2 className="card-header">Fitness Goal</h2>
            <select
              name="fitnessGoal"
              value={formData.fitnessGoal}
              onChange={handleChange}
              className="input-field"
              required
            >
              <option value="">Select Your Goal</option>
              <option value="weight_loss">Weight Loss</option>
              <option value="weight_gain">Weight Gain</option>
              <option value="muscle_building">Muscle Building</option>
              <option value="maintenance">Maintenance</option>
            </select>
          </div>

          {/* Health Conditions */}
          <div className="card">
            <h2 className="card-header">Health Conditions</h2>
            <p className="text-sm text-gray-600 mb-4">
              Select any health conditions that apply to you. This helps us provide personalized recommendations.
            </p>
            <div className="grid md:grid-cols-3 gap-3">
              {healthConditionsList.map((condition) => (
                <label
                  key={condition.value}
                  className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                    formData.healthConditions.includes(condition.value)
                      ? 'bg-primary-50 border-primary-500'
                      : 'bg-white border-gray-300 hover:border-primary-300'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={formData.healthConditions.includes(condition.value)}
                    onChange={() => handleHealthConditionToggle(condition.value)}
                    className="mr-2"
                  />
                  <span className="text-sm">{condition.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="btn-primary px-8 py-3 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Saving...' : 'Save Profile'}
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default ProfilePage;
