import React from 'react';
import { Link } from 'react-router-dom';

const LandingPage = () => {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div 
        className="relative bg-gradient-to-r from-primary-600 to-primary-800 text-white"
        style={{
          backgroundImage: 'linear-gradient(rgba(22, 163, 74, 0.9), rgba(21, 128, 61, 0.9)), url("https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=1200")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              DIET Track
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-primary-100">
              Your Personal Health & Nutrition Companion
            </p>
            <p className="text-lg mb-12 max-w-3xl mx-auto">
              Track your meals, calculate BMI, and get personalized fitness recommendations 
              based on your health conditions. All in one integrated platform.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/register"
                className="bg-white text-primary-700 px-8 py-3 rounded-lg font-semibold text-lg hover:bg-primary-50 transition-colors shadow-lg"
              >
                Get Started
              </Link>
              <Link
                to="/login"
                className="bg-primary-700 text-white px-8 py-3 rounded-lg font-semibold text-lg hover:bg-primary-800 transition-colors border-2 border-white"
              >
                Sign In
              </Link>
              <Link
                to="/admin-login"
                className="bg-primary-700 text-white px-8 py-3 rounded-lg font-semibold text-lg hover:bg-primary-800 transition-colors border-2 border-white"
              >
                Admin
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Why Choose DIET Track?
            </h2>
            <p className="text-lg text-gray-600">
              Everything you need to manage your health and nutrition in one place
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="card text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">BMI Calculator</h3>
              <p className="text-gray-600">
                Calculate your Body Mass Index and track your progress over time with detailed insights.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="card text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Meal Tracking</h3>
              <p className="text-gray-600">
                Log your daily meals and get detailed nutritional breakdowns with our comprehensive food database.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="card text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Fitness Goals</h3>
              <p className="text-gray-600">
                Set personalized fitness goals and receive tailored recommendations for weight loss, gain, or muscle building.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="card text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Health Condition Aware</h3>
              <p className="text-gray-600">
                Get recommendations tailored to your specific health conditions like diabetes, hypertension, and more.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="card text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Visual Analytics</h3>
              <p className="text-gray-600">
                Track your progress with beautiful charts and graphs showing your nutrition intake vs. goals.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="card text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Comprehensive Database</h3>
              <p className="text-gray-600">
                Access a rich database of Indian and international foods with detailed nutritional information.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Health Conditions Section */}
      <div className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Personalized for Your Health
            </h2>
            <p className="text-lg text-gray-600">
              Get customized recommendations based on your specific health conditions
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-4">
            {[
              'Diabetes',
              'High Blood Pressure',
              'High Cholesterol',
              'PCOS/PCOD',
              'Thyroid Disorders',
              'Heart Disease',
              'Kidney Issues',
              'Pregnancy/Nursing',
              'Celiac/Gluten-Free',
              'Lactose Intolerance',
              'Vegetarian',
              'Vegan',
            ].map((condition) => (
              <div
                key={condition}
                className="bg-white rounded-lg p-4 text-center shadow-sm hover:shadow-md transition-shadow"
              >
                <p className="font-medium text-gray-800">{condition}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-16 bg-primary-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Start Your Health Journey?
          </h2>
          <p className="text-xl mb-8">
            Join DIET Track today and take control of your nutrition and fitness goals.
          </p>
          <Link
            to="/register"
            className="bg-white text-primary-700 px-8 py-3 rounded-lg font-semibold text-lg hover:bg-primary-50 transition-colors shadow-lg inline-block"
          >
            Create Free Account
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
