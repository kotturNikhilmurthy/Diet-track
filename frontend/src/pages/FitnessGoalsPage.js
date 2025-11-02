import React from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import { getFitnessGoalLabel } from '../utils/helpers';

const FitnessGoalsPage = () => {
  const { user } = useAuth();

  const goals = [
    {
      id: 'weight_loss',
      title: 'Weight Loss',
      description: 'Lose weight in a healthy and sustainable way',
      icon: '📉',
      features: [
        'Calorie deficit of 500 cal/day',
        'High protein to preserve muscle',
        'Balanced macronutrients',
        'Focus on whole foods',
      ],
      color: 'bg-red-50 border-red-200',
    },
    {
      id: 'weight_gain',
      title: 'Weight Gain',
      description: 'Gain weight healthily with proper nutrition',
      icon: '📈',
      features: [
        'Calorie surplus of 500 cal/day',
        'Nutrient-dense foods',
        'Regular meals and snacks',
        'Strength training recommended',
      ],
      color: 'bg-blue-50 border-blue-200',
    },
    {
      id: 'muscle_building',
      title: 'Muscle Building',
      description: 'Build lean muscle mass with optimal nutrition',
      icon: '💪',
      features: [
        'High protein intake (2.2g/kg)',
        'Slight calorie surplus',
        'Post-workout nutrition',
        'Progressive overload training',
      ],
      color: 'bg-purple-50 border-purple-200',
    },
    {
      id: 'maintenance',
      title: 'Maintenance',
      description: 'Maintain your current weight and health',
      icon: '⚖️',
      features: [
        'Balanced calorie intake',
        'Moderate protein (1.6g/kg)',
        'Flexible meal planning',
        'Focus on overall health',
      ],
      color: 'bg-green-50 border-green-200',
    },
  ];

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Fitness Goals</h1>
          <p className="text-gray-600">
            Choose a goal that aligns with your health objectives and get personalized nutrition recommendations.
          </p>
        </div>

        {/* Current Goal */}
        {user?.fitnessGoal && (
          <div className="card bg-gradient-to-r from-primary-500 to-primary-700 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-primary-100 mb-1">Your Current Goal</p>
                <h2 className="text-2xl font-bold">{getFitnessGoalLabel(user.fitnessGoal)}</h2>
              </div>
              <Link to="/profile" className="bg-white text-primary-700 px-4 py-2 rounded-lg font-medium hover:bg-primary-50">
                Change Goal
              </Link>
            </div>

            {user.dailyCalorieGoal && (
              <div className="mt-6 grid grid-cols-4 gap-4">
                <div className="bg-white bg-opacity-20 rounded-lg p-3 text-center">
                  <p className="text-primary-100 text-sm mb-1">Daily Calories</p>
                  <p className="text-2xl font-bold">{user.dailyCalorieGoal}</p>
                </div>
                <div className="bg-white bg-opacity-20 rounded-lg p-3 text-center">
                  <p className="text-primary-100 text-sm mb-1">Protein</p>
                  <p className="text-2xl font-bold">{user.dailyProteinGoal}g</p>
                </div>
                <div className="bg-white bg-opacity-20 rounded-lg p-3 text-center">
                  <p className="text-primary-100 text-sm mb-1">Carbs</p>
                  <p className="text-2xl font-bold">{user.dailyCarbsGoal}g</p>
                </div>
                <div className="bg-white bg-opacity-20 rounded-lg p-3 text-center">
                  <p className="text-primary-100 text-sm mb-1">Fat</p>
                  <p className="text-2xl font-bold">{user.dailyFatGoal}g</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Goal Options */}
        <div className="grid md:grid-cols-2 gap-6">
          {goals.map((goal) => (
            <div
              key={goal.id}
              className={`card border-2 ${goal.color} ${
                user?.fitnessGoal === goal.id ? 'ring-2 ring-primary-500' : ''
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <span className="text-4xl">{goal.icon}</span>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{goal.title}</h3>
                    <p className="text-sm text-gray-600">{goal.description}</p>
                  </div>
                </div>
                {user?.fitnessGoal === goal.id && (
                  <span className="bg-primary-600 text-white text-xs px-2 py-1 rounded-full">
                    Active
                  </span>
                )}
              </div>

              <ul className="space-y-2 mb-4">
                {goal.features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm text-gray-700">
                    <svg className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              {user?.fitnessGoal !== goal.id && (
                <Link
                  to="/profile"
                  className="btn-primary w-full text-center"
                >
                  Select This Goal
                </Link>
              )}
            </div>
          ))}
        </div>

        {/* Tips Section */}
        <div className="card bg-blue-50 border border-blue-200">
          <h2 className="text-xl font-bold text-gray-900 mb-4">💡 Tips for Success</h2>
          <ul className="space-y-3">
            <li className="flex items-start gap-3">
              <span className="text-blue-600 font-bold">1.</span>
              <p className="text-gray-700">
                <strong>Be Consistent:</strong> Track your meals daily to stay on top of your nutrition goals.
              </p>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-blue-600 font-bold">2.</span>
              <p className="text-gray-700">
                <strong>Stay Hydrated:</strong> Drink at least 8 glasses of water per day for optimal health.
              </p>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-blue-600 font-bold">3.</span>
              <p className="text-gray-700">
                <strong>Get Enough Sleep:</strong> Aim for 7-9 hours of quality sleep each night.
              </p>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-blue-600 font-bold">4.</span>
              <p className="text-gray-700">
                <strong>Exercise Regularly:</strong> Combine your nutrition plan with regular physical activity.
              </p>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-blue-600 font-bold">5.</span>
              <p className="text-gray-700">
                <strong>Be Patient:</strong> Sustainable changes take time. Focus on progress, not perfection.
              </p>
            </li>
          </ul>
        </div>

        {/* CTA */}
        {!user?.fitnessGoal && (
          <div className="card bg-gradient-to-r from-primary-600 to-primary-800 text-white text-center">
            <h2 className="text-2xl font-bold mb-2">Ready to Start?</h2>
            <p className="mb-6 text-primary-100">
              Complete your profile and set your fitness goal to get personalized recommendations.
            </p>
            <Link to="/profile" className="bg-white text-primary-700 px-6 py-3 rounded-lg font-semibold inline-block hover:bg-primary-50">
              Complete Profile
            </Link>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default FitnessGoalsPage;
