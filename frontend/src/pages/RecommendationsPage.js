import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import { useLocation } from 'react-router-dom';
import { userAPI } from '../utils/api';
import { getHealthConditionLabel } from '../utils/helpers';

const RecommendationsPage = () => {
  const { user } = useAuth();
  const [recommendations, setRecommendations] = useState(null);
  const [loading, setLoading] = useState(true);
  const [emailSending, setEmailSending] = useState(false);
  const [emailSuccess, setEmailSuccess] = useState(false);
  const [emailError, setEmailError] = useState('');

  useEffect(() => {
    fetchRecommendations();
  }, []);

  // If navigated with a hash, scroll that section into view
  const location = useLocation();
  useEffect(() => {
    if (location.hash) {
      const el = document.getElementById(location.hash.replace('#', ''));
      if (el) {
        setTimeout(() => el.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
      }
    }
  }, [location]);

  const fetchRecommendations = async () => {
    try {
      setLoading(true);
      const response = await userAPI.getRecommendations();
      setRecommendations(response.data);
    } catch (error) {
      console.error('Error fetching recommendations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendEmail = async () => {
    try {
      setEmailSending(true);
      setEmailError('');
      setEmailSuccess(false);
      
      await userAPI.sendDietPlan();
      setEmailSuccess(true);
      
      // Hide success message after 5 seconds
      setTimeout(() => setEmailSuccess(false), 5000);
    } catch (error) {
      console.error('Error sending email:', error);
      setEmailError(error.response?.data?.message || 'Failed to send email. Please try again.');
      
      // Hide error message after 5 seconds
      setTimeout(() => setEmailError(''), 5000);
    } finally {
      setEmailSending(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Personalized Recommendations</h1>
            <p className="text-gray-600">
              Based on your health profile, fitness goals, and health conditions.
            </p>
          </div>
          <button
            onClick={handleSendEmail}
            disabled={emailSending}
            className="btn-primary flex items-center gap-2"
          >
            {emailSending ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Sending...
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Email Diet Plan
              </>
            )}
          </button>
        </div>

        {/* Success Message */}
        {emailSuccess && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center gap-2">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span>Diet plan has been sent to your email: {user?.email}</span>
          </div>
        )}

        {/* Error Message */}
        {emailError && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <span>{emailError}</span>
          </div>
        )}

        {/* User Profile Summary */}
        <div className="card bg-gradient-to-r from-primary-500 to-primary-700 text-white">
          <h2 className="text-xl font-bold mb-4">Your Health Profile</h2>
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <p className="text-primary-100 text-sm mb-1">BMI</p>
              <p className="text-2xl font-bold">{user?.bmi || 'N/A'}</p>
              {user?.bmiCategory && (
                <p className="text-sm text-primary-100">{user.bmiCategory}</p>
              )}
            </div>
            <div>
              <p className="text-primary-100 text-sm mb-1">Fitness Goal</p>
              <p className="text-lg font-semibold">
                {user?.fitnessGoal ? user.fitnessGoal.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') : 'Not Set'}
              </p>
            </div>
            <div>
              <p className="text-primary-100 text-sm mb-1">Health Conditions</p>
              <p className="text-lg font-semibold">
                {user?.healthConditions?.length || 0} condition(s)
              </p>
            </div>
          </div>

          {user?.healthConditions && user.healthConditions.length > 0 && (
            <div className="mt-4 pt-4 border-t border-primary-400">
              <p className="text-primary-100 text-sm mb-2">Your Health Conditions:</p>
              <div className="flex flex-wrap gap-2">
                {user.healthConditions.map((condition) => (
                  <span
                    key={condition}
                    className="bg-white bg-opacity-20 px-3 py-1 rounded-full text-sm"
                  >
                    {getHealthConditionLabel(condition)}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Recommendations Sections */}
        {recommendations && (
          <>
            {/* Recommended Diet Plan - new section */}
            <div id="recommended-diet-plan" className="card">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  {/* Monitor / browser window icon */}
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-6l1 2H10l1-2H5a2 2 0 01-2-2V7z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 3v2M16 3v2" />
                  </svg>
                </div>
                <h2 className="text-xl font-bold text-gray-900">Recommended Diet Plan</h2>
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div className="col-span-2">
                  <h3 className="font-semibold mb-2">What to include</h3>
                  <ul className="list-disc list-inside mb-4">
                    {(recommendations.dietary || []).filter(r => !/(avoid|limit|reduce|less|skip|no\s+)/i.test(r)).slice(0,6).map((item, i) => (
                      <li key={i} className="text-gray-700">{item}</li>
                    ))}
                  </ul>

                  <h3 className="font-semibold mb-2">What to avoid</h3>
                  <ul className="list-disc list-inside">
                    {(recommendations.dietary || []).filter(r => /(avoid|limit|reduce|less|skip|no\s+)/i.test(r)).slice(0,6).map((item, i) => (
                      <li key={i} className="text-gray-700">{item}</li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Quick Meal Plan (1 day)</h3>
                  <div className="bg-white p-3 rounded-lg border">
                    <p className="text-sm text-gray-600">Target Calories:</p>
                    <p className="text-lg font-bold mb-2">{user?.dailyCalories || '—'} kcal</p>
                    <p className="text-sm text-gray-600">Sample:</p>
                    <ul className="mt-2 space-y-2 text-gray-700">
                      <li><strong>Breakfast:</strong> Oats with milk, nuts and fruit</li>
                      <li><strong>Lunch:</strong> Brown rice, grilled chicken/fish/tofu and salad</li>
                      <li><strong>Snack:</strong> Greek yogurt or fruit and a handful of nuts</li>
                      <li><strong>D inner:</strong> Vegetables, lentils/beans and a small portion of whole grains</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* General Recommendations */}
            {recommendations.general && recommendations.general.length > 0 && (
              <div className="card">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">General Recommendations</h2>
                </div>
                <ul className="space-y-3">
                  {recommendations.general.map((rec, index) => (
                    <li key={index} className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                      <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <p className="text-gray-700">{rec}</p>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Dietary Recommendations */}
            {recommendations.dietary && recommendations.dietary.length > 0 && (
              <div className="card">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">Dietary Recommendations</h2>
                </div>
                <ul className="space-y-3">
                  {recommendations.dietary.map((rec, index) => (
                    <li key={index} className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                      <svg className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <p className="text-gray-700">{rec}</p>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Exercise Recommendations */}
            {recommendations.exercise && recommendations.exercise.length > 0 && (
              <div className="card">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">Exercise Recommendations</h2>
                </div>
                <ul className="space-y-3">
                  {recommendations.exercise.map((rec, index) => (
                    <li key={index} className="flex items-start gap-3 p-3 bg-purple-50 rounded-lg">
                      <svg className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <p className="text-gray-700">{rec}</p>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Warnings */}
            {recommendations.warnings && recommendations.warnings.length > 0 && (
              <div className="card border-2 border-red-200 bg-red-50">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  <h2 className="text-xl font-bold text-red-900">Important Warnings</h2>
                </div>
                <ul className="space-y-3">
                  {recommendations.warnings.map((warning, index) => (
                    <li key={index} className="flex items-start gap-3 p-3 bg-white rounded-lg border border-red-200">
                      <svg className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                      <p className="text-red-900 font-medium">{warning}</p>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </>
        )}

        {/* Disclaimer */}
        <div className="card bg-yellow-50 border border-yellow-200">
          <div className="flex items-start gap-3">
            <svg className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <h3 className="font-bold text-yellow-900 mb-2">Important Disclaimer</h3>
              <p className="text-sm text-yellow-800">
                These recommendations are for informational purposes only and should not replace professional medical advice. 
                Always consult with your healthcare provider, registered dietitian, or other qualified health professional 
                before making any changes to your diet or exercise routine, especially if you have existing health conditions.
              </p>
            </div>
          </div>
        </div>

        {/* Update Profile CTA */}
        {(!user?.fitnessGoal || !user?.healthConditions || user.healthConditions.length === 0) && (
          <div className="card bg-gradient-to-r from-primary-600 to-primary-800 text-white text-center">
            <h2 className="text-2xl font-bold mb-2">Get More Personalized Recommendations</h2>
            <p className="mb-6 text-primary-100">
              Complete your health profile to receive more tailored recommendations.
            </p>
            <a href="/profile" className="bg-white text-primary-700 px-6 py-3 rounded-lg font-semibold inline-block hover:bg-primary-50">
              Update Profile
            </a>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default RecommendationsPage;
