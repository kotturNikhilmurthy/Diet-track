import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Chart as ChartJS, ArcElement, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import { mealAPI } from '../utils/api';
import {
  calculateBMI,
  getBMICategory,
  getTodayDate,
  getDateRange,
  roundTo,
  getMicronutrientLabel,
  getNutrientColor,
} from '../utils/helpers';
import { buildHabitCoachingPlan } from '../utils/habits';

ChartJS.register(ArcElement, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const Dashboard = () => {
  const { user } = useAuth();
  const [todayMeals, setTodayMeals] = useState([]);
  const [weeklyData, setWeeklyData] = useState([]);
  const [micronutrientSummary, setMicronutrientSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch today's meals
      const today = getTodayDate();
      const todayResponse = await mealAPI.getMeals({
        startDate: today,
        endDate: today,
      });
      setTodayMeals(todayResponse.data.meals || []);

      // Fetch last 7 days summary
      const { startDate, endDate } = getDateRange(7);
      const weeklyResponse = await mealAPI.getDailySummary({
        startDate,
        endDate,
      });
      setWeeklyData(weeklyResponse.data.summary || []);

      try {
        const micronutrientResponse = await mealAPI.getMicronutrientSummary();
        setMicronutrientSummary(micronutrientResponse.data);
      } catch (microError) {
        console.error('Error fetching micronutrient summary:', microError);
        setMicronutrientSummary(null);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate today's totals
  const todayTotals = todayMeals.reduce(
    (acc, meal) => ({
      calories: acc.calories + (meal.totalNutrition?.calories || 0),
      protein: acc.protein + (meal.totalNutrition?.protein || 0),
      carbs: acc.carbs + (meal.totalNutrition?.carbs?.total || 0),
      fat: acc.fat + (meal.totalNutrition?.fat?.total || 0),
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );

  // BMI calculation
  const bmi = user?.bmi || (user?.weight && user?.height ? calculateBMI(user.weight.value, user.height.value, user.weight.unit, user.height.unit) : null);
  const bmiCategory = bmi ? getBMICategory(bmi) : null;

  // Macros chart data
  const macrosData = {
    labels: ['Protein', 'Carbs', 'Fat'],
    datasets: [
      {
        data: [todayTotals.protein, todayTotals.carbs, todayTotals.fat],
        backgroundColor: ['#3b82f6', '#10b981', '#f59e0b'],
        borderWidth: 0,
      },
    ],
  };

  // Weekly calories chart data
  const weeklyChartData = {
    labels: weeklyData.map((day) => new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })),
    datasets: [
      {
        label: 'Calories',
        data: weeklyData.map((day) => day.totalCalories),
        backgroundColor: '#22c55e',
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
      },
    },
  };

  const {
    trackedMicronutrientDays,
    hasMicronutrientEntries,
    topDeficiencies,
    topExcesses,
    habitPlan,
  } = useMemo(() => {
    const data = micronutrientSummary;
    const trackedDays = data?.range?.trackedDays || 0;
    const hasEntries = Boolean(data?.summary?.length) && trackedDays > 0;

    const sortedDeficiencies = [...(data?.deficiencies || [])]
      .sort((a, b) => (a.percentage ?? Infinity) - (b.percentage ?? Infinity));
    const defTop = sortedDeficiencies.slice(0, 3);

    const sortedExcesses = [...(data?.excesses || [])]
      .sort((a, b) => (b.percentage ?? 0) - (a.percentage ?? 0));
    const excTop = sortedExcesses.slice(0, 3);

    const plan = buildHabitCoachingPlan({
      user,
      todayMeals,
      weeklyData,
      topDeficiencies: defTop,
      topExcesses: excTop,
      trackedMicronutrientDays: trackedDays,
    });

    return {
      trackedMicronutrientDays: trackedDays,
      hasMicronutrientEntries: hasEntries,
      topDeficiencies: defTop,
      topExcesses: excTop,
      habitPlan: plan,
    };
  }, [micronutrientSummary, user, todayMeals, weeklyData]);

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
        {/* Welcome Section */}
        <div className="card bg-gradient-to-r from-primary-500 to-primary-700 text-white">
          <h1 className="text-3xl font-bold mb-2">Welcome back, {user?.name}! 👋</h1>
          <p className="text-primary-100">
            Track your nutrition, monitor your progress, and achieve your fitness goals.
          </p>
        </div>

        {/* BMI Card */}
        <div className="grid md:grid-cols-3 gap-6">
          <div className="card">
            <h2 className="card-header">Your BMI</h2>
            {bmi ? (
              <div className="text-center">
                <div className="text-5xl font-bold text-primary-600 mb-2">{bmi}</div>
                <div className={`text-lg font-semibold ${bmiCategory?.color}`}>
                  {bmiCategory?.category}
                </div>
                {user?.weight && user?.height && (
                  <div className="mt-4 text-sm text-gray-600">
                    <p>Weight: {user.weight.value} {user.weight.unit}</p>
                    <p>Height: {user.height.value} {user.height.unit}</p>
                  </div>
                )}
                <Link to="/profile" className="btn-primary mt-4 inline-block text-sm">
                  Update Profile
                </Link>
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-gray-600 mb-4">Complete your profile to calculate BMI</p>
                <Link to="/profile" className="btn-primary inline-block">
                  Complete Profile
                </Link>
              </div>
            )}
          </div>

          {/* Daily Calorie Goal */}
          <div className="card">
            <h2 className="card-header">Daily Calorie Goal</h2>
            {user?.dailyCalorieGoal ? (
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-800 mb-2">
                  {Math.round(todayTotals.calories)} / {user.dailyCalorieGoal}
                </div>
                <div className="text-sm text-gray-600 mb-4">calories</div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-primary-600 h-3 rounded-full transition-all"
                    style={{
                      width: `${Math.min((todayTotals.calories / user.dailyCalorieGoal) * 100, 100)}%`,
                    }}
                  ></div>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  {user.dailyCalorieGoal - todayTotals.calories > 0
                    ? `${Math.round(user.dailyCalorieGoal - todayTotals.calories)} calories remaining`
                    : `${Math.round(todayTotals.calories - user.dailyCalorieGoal)} calories over goal`}
                </p>
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-gray-600 mb-4">Set your fitness goal to see calorie target</p>
                <Link to="/profile" className="btn-primary inline-block">
                  Set Goal
                </Link>
              </div>
            )}
          </div>

          {/* Fitness Goal */}
          <div className="card">
            <h2 className="card-header">Fitness Goal</h2>
            {user?.fitnessGoal ? (
              <div className="text-center">
                <div className="text-2xl font-semibold text-gray-800 mb-4">
                  {user.fitnessGoal.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                </div>
                {user.dailyProteinGoal && user.dailyCarbsGoal && user.dailyFatGoal && (
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Protein:</span>
                      <span className="font-semibold">{user.dailyProteinGoal}g</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Carbs:</span>
                      <span className="font-semibold">{user.dailyCarbsGoal}g</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Fat:</span>
                      <span className="font-semibold">{user.dailyFatGoal}g</span>
                    </div>
                  </div>
                )}
                <Link to="/goals" className="btn-primary mt-4 inline-block text-sm">
                  View Details
                </Link>
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-gray-600 mb-4">Set your fitness goal</p>
                <Link to="/profile" className="btn-primary inline-block">
                  Set Goal
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Charts */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Today's Macros */}
          <div className="card">
            <h2 className="card-header">Today's Macros</h2>
            {todayTotals.calories > 0 ? (
              <div style={{ height: '300px' }}>
                <Doughnut data={macrosData} options={chartOptions} />
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <p className="mb-4">No meals logged today</p>
                <Link to="/meals" className="btn-primary inline-block">
                  Track Meal
                </Link>
              </div>
            )}
          </div>

          {/* Weekly Calories */}
          <div className="card">
            <h2 className="card-header">Weekly Calories</h2>
            {weeklyData.length > 0 ? (
              <div style={{ height: '300px' }}>
                <Bar data={weeklyChartData} options={chartOptions} />
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <p>No data available for the past week</p>
              </div>
            )}
          </div>
        </div>

        {/* Personal Insights */}
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="card">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <h2 className="card-header mb-0">Micronutrient Snapshot</h2>
              {trackedMicronutrientDays > 0 && (
                <span className="text-xs text-gray-500">
                  Based on {trackedMicronutrientDays} tracked {trackedMicronutrientDays === 1 ? 'day' : 'days'}
                </span>
              )}
            </div>

            {hasMicronutrientEntries ? (
              <div className="mt-4 space-y-5">
                {topDeficiencies.length > 0 ? (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-700 mb-3">Top Nutrient Gaps</h3>
                    <div className="space-y-4">
                      {topDeficiencies.map((item) => {
                        const percentage = Number.isFinite(item.percentage) ? Math.round(item.percentage) : 0;
                        const progress = Math.min(Math.max(percentage, 4), 115);
                        const colorClass = getNutrientColor(percentage);
                        const targetAmount = item.target?.amount ? `${item.target.amount} ${item.target.unit}` : 'target';
                        const perDay = roundTo(item.perDay || 0, 2);
                        return (
                          <div key={`${item.group}-${item.nutrient}`}>
                            <div className="flex items-center justify-between text-sm text-gray-700">
                              <span className="font-semibold text-gray-800">{getMicronutrientLabel(item.nutrient)}</span>
                              <span className="text-gray-500">
                                {perDay} {item.target?.unit || ''} / {targetAmount}
                              </span>
                            </div>
                            <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
                              <div
                                className={`${colorClass} h-2 transition-all`}
                                style={{ width: `${progress}%` }}
                              ></div>
                            </div>
                            <div className="text-xs text-gray-500 mt-1">{percentage}% of daily target</div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-gray-600">
                    You're meeting key micronutrient targets on tracked days. Great job staying consistent!
                  </p>
                )}

                {topExcesses.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-700 mb-3">Potential Excess Intake</h3>
                    <div className="space-y-2">
                      {topExcesses.map((item) => {
                        const percentage = Number.isFinite(item.percentage) ? Math.round(item.percentage) : null;
                        const statusLabel = percentage ? `${percentage}% of recommended max` : 'Above recommended';
                        return (
                          <div
                            key={`excess-${item.group}-${item.nutrient}`}
                            className="flex items-center justify-between rounded-md bg-red-50 px-3 py-2 text-sm text-red-600"
                          >
                            <span className="font-medium">{getMicronutrientLabel(item.nutrient)}</span>
                            <span>{statusLabel}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                <Link to="/recommendations" className="btn-secondary inline-flex items-center text-sm">
                  Improve with Food Suggestions
                </Link>
              </div>
            ) : (
              <p className="mt-4 text-sm text-gray-600">
                Log meals consistently to unlock micronutrient insights tailored to your habits.
              </p>
            )}
          </div>

          <div className="card">
            <h2 className="card-header">Habit Coaching</h2>
            <div className="space-y-6">
              {habitPlan?.focus && (
                <div className="rounded-lg bg-primary-50 border border-primary-100 p-4 text-primary-800">
                  <div className="text-sm font-semibold uppercase tracking-wide mb-1">{habitPlan.focus.title}</div>
                  <p className="text-sm mb-2">{habitPlan.focus.message}</p>
                  <p className="text-sm font-medium">{habitPlan.focus.action}</p>
                </div>
              )}

              {habitPlan?.reminders?.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">Smart Reminders</h3>
                  <div className="space-y-2">
                    {habitPlan.reminders.slice(0, 3).map((reminder, index) => (
                      <div
                        key={`reminder-${reminder.title}-${index}`}
                        className="rounded-md border border-gray-200 px-3 py-2"
                      >
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <span>{reminder.timeHint}</span>
                          <span>Reminder</span>
                        </div>
                        <div className="text-sm font-semibold text-gray-800">{reminder.title}</div>
                        <p className="text-sm text-gray-600">{reminder.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {habitPlan?.challenges?.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">Challenges</h3>
                  <div className="space-y-3">
                    {habitPlan.challenges.slice(0, 2).map((challenge, index) => (
                      <div key={`challenge-${challenge.title}-${index}`} className="rounded-md bg-gray-100 px-3 py-3">
                        <div className="text-xs uppercase tracking-wide text-gray-500">
                          {challenge.timeframe === 'today' ? 'Today' : 'This Week'}
                        </div>
                        <div className="text-sm font-semibold text-gray-800">{challenge.title}</div>
                        <p className="text-sm text-gray-600">{challenge.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {habitPlan?.tips?.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">Pro Tips</h3>
                  <ul className="list-disc list-inside space-y-2 text-sm text-gray-600">
                    {habitPlan.tips.slice(0, 3).map((tip, index) => (
                      <li key={`tip-${tip.title}-${index}`}>
                        <span className="font-medium text-gray-800">{tip.title}: </span>
                        {tip.description}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-4 gap-4">
          <Link to="/meals" className="card hover:shadow-lg transition-shadow text-center">
            <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <h3 className="font-semibold text-gray-800">Track Meal</h3>
          </Link>

          <Link to="/goals" className="card hover:shadow-lg transition-shadow text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="font-semibold text-gray-800">Fitness Goals</h3>
          </Link>

          <Link to="/recommendations" className="card hover:shadow-lg transition-shadow text-center">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <h3 className="font-semibold text-gray-800">Recommendations</h3>
          </Link>

          <Link to="/profile" className="card hover:shadow-lg transition-shadow text-center">
            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h3 className="font-semibold text-gray-800">My Profile</h3>
          </Link>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
