import { getMicronutrientLabel } from './helpers';

const nutrientStrategies = {
  iron: {
    foods: ['spinach', 'masoor dal', 'chickpeas'],
    tip: 'Pair with vitamin C sources like lemon or amla to boost absorption.',
  },
  b12: {
    foods: ['paneer', 'curd', 'eggs'],
    tip: 'Include one dairy or egg portion daily to support energy and focus.',
  },
  c: {
    foods: ['guava', 'amla', 'citrus fruits'],
    tip: 'Add a raw fruit or veggie at snacks to lift immunity and iron uptake.',
  },
  a: {
    foods: ['carrot', 'sweet potato', 'papaya'],
    tip: 'Blend orange veggies into soups or stir-fries for vision support.',
  },
  d: {
    foods: ['fortified milk', 'mushrooms', 'egg yolk'],
    tip: 'Catch 15 minutes of morning sunlight along with dietary sources.',
  },
  e: {
    foods: ['almonds', 'sunflower seeds', 'avocado'],
    tip: 'Sprinkle mixed seeds over salads or dal for antioxidant support.',
  },
  k: {
    foods: ['spinach', 'broccoli', 'cabbage'],
    tip: 'Rotate green sabzis through the week to aid bone health.',
  },
  folate: {
    foods: ['moong dal', 'beetroot', 'spinach'],
    tip: 'Include a sprouted or lentil dish thrice a week to lift folate intake.',
  },
  b6: {
    foods: ['banana', 'potatoes', 'sunflower seeds'],
    tip: 'Snack on a banana with nuts to support metabolism and mood.',
  },
  b3: {
    foods: ['peanuts', 'chicken', 'brown rice'],
    tip: 'Swap refined grains with brown rice or millets for sustained energy.',
  },
  b2: {
    foods: ['curd', 'almonds', 'eggs'],
    tip: 'Add a small bowl of curd in lunch to aid digestion and B-vitamin intake.',
  },
  b1: {
    foods: ['whole wheat roti', 'sunflower seeds', 'legumes'],
    tip: 'Use whole grains and legumes in daily meals to support nerve health.',
  },
  potassium: {
    foods: ['banana', 'coconut water', 'sweet potato'],
    tip: 'Balance salt-heavy meals with potassium rich picks like banana or coconut water.',
  },
  magnesium: {
    foods: ['almonds', 'pumpkin seeds', 'oats'],
    tip: 'Toss seeds into breakfast bowls to calm nerves and support sleep.',
  },
  calcium: {
    foods: ['milk', 'curd', 'paneer'],
    tip: 'Aim for two dairy portions daily or fortified plant alternatives.',
  },
  zinc: {
    foods: ['pumpkin seeds', 'cashews', 'chickpeas'],
    tip: 'A handful of mixed nuts is an easy zinc booster for immunity.',
  },
  selenium: {
    foods: ['sunflower seeds', 'whole grains', 'eggs'],
    tip: 'Rotate nut-and-seed mixes for antioxidant protection.',
  },
};

const getNextMealReminder = (loggedMeals, currentHour) => {
  if (!loggedMeals.has('breakfast') && currentHour < 11) {
    return {
      title: 'Plan your breakfast',
      description: 'Log a protein-rich breakfast before 10:30 AM to steady energy.',
      timeHint: 'morning',
    };
  }

  if (!loggedMeals.has('lunch') && currentHour >= 11 && currentHour < 16) {
    return {
      title: 'Prep your lunch check-in',
      description: 'Log lunch within an hour of eating to keep your diary on track.',
      timeHint: 'afternoon',
    };
  }

  if (!loggedMeals.has('dinner') && currentHour >= 16) {
    return {
      title: 'Dinner tracking reminder',
      description: 'Log dinner before 9 PM to capture the full day and stay accountable.',
      timeHint: 'evening',
    };
  }

  return null;
};

export const buildHabitCoachingPlan = ({
  user,
  todayMeals,
  weeklyData,
  topDeficiencies,
  topExcesses,
  trackedMicronutrientDays,
}) => {
  const plan = {
    focus: null,
    reminders: [],
    challenges: [],
    tips: [],
  };

  const now = new Date();
  const currentHour = now.getHours();
  const mealTypesLogged = new Set(todayMeals.map((meal) => meal.mealType));
  const weeklyLoggedDays = weeklyData?.length || 0;

  if (topDeficiencies && topDeficiencies.length > 0) {
    const deficiency = topDeficiencies[0];
    const nutrientKey = deficiency.nutrient;
    const nutrientLabel = getMicronutrientLabel(nutrientKey);
    const strategy = nutrientStrategies[nutrientKey];
    const foods = strategy?.foods?.slice(0, 3) || [];

    plan.focus = {
      type: 'deficiency',
      title: `${nutrientLabel} focus`,
      message: `You're averaging ${Math.round(deficiency.percentage ?? 0)}% of your daily ${nutrientLabel} target.`,
      action:
        foods.length > 0
          ? `Add ${foods.join(', ')} to your meals to close the gap.`
          : `Include one ${nutrientLabel}-rich option in today's meals.`,
      tip: strategy?.tip,
    };

    plan.challenges.push({
      title: `Today: add a ${nutrientLabel} booster`,
      timeframe: 'today',
      description:
        foods.length > 0
          ? `Pick at least one ${nutrientLabel}-rich food like ${foods[0]} or ${foods[1] || foods[0]} in your next meal.`
          : `Include a nutrient-dense ingredient supporting ${nutrientLabel}.`,
    });
  } else if (topExcesses && topExcesses.length > 0) {
    const excess = topExcesses[0];
    const nutrientLabel = getMicronutrientLabel(excess.nutrient);
    plan.focus = {
      type: 'moderation',
      title: `${nutrientLabel} moderation`,
      message: `Your intake crosses ${Math.round(excess.percentage ?? 0)}% of the recommended upper limit.`,
      action: 'Balance the next meal with lighter prep methods and plenty of vegetables.',
      tip: 'Opt for steaming, grilling, or sautéing with minimal oil for the rest of the day.',
    };

    plan.challenges.push({
      title: 'Today: go light on added fats',
      timeframe: 'today',
      description: 'Choose grilled, steamed, or air-fried options and skip the extra oil tempering once today.',
    });
  } else {
    plan.focus = {
      type: 'consistency',
      title: 'Consistency wins',
      message: 'Keep logging meals daily to personalize deeper insights.',
      action: 'Aim for three complete meal logs today.',
      tip: 'Set a 2-minute timer after each meal to quickly capture it in the tracker.',
    };
  }

  plan.reminders.push({
    title: 'Hydration check-in',
    description: 'Sip water or infused water every couple of hours to stay energised.',
    timeHint: currentHour < 12 ? 'morning' : currentHour < 17 ? 'afternoon' : 'evening',
  });

  const nextMealReminder = getNextMealReminder(mealTypesLogged, currentHour);
  if (nextMealReminder) {
    plan.reminders.push(nextMealReminder);
  }

  if (plan.focus?.type === 'deficiency') {
    plan.reminders.push({
      title: 'Smart grocery note',
      description: 'Add one nutrient-rich item from your focus list to this week’s shopping.',
      timeHint: 'planning',
    });
  }

  plan.challenges.push({
    title: 'This week: streak of 3 days',
    timeframe: 'this_week',
    description:
      trackedMicronutrientDays >= 3
        ? 'Great streak! Keep going by logging meals on your next three active days.'
        : 'Log meals on three consecutive days this week to unlock advanced trends.',
  });

  if (weeklyLoggedDays < 5) {
    plan.tips.push({
      title: 'Build a logging routine',
      description: 'Set gentle alarms around meal times so you capture entries before the day ends.',
    });
  }

  if (user?.fitnessGoal === 'weight_loss') {
    plan.tips.push({
      title: 'Protein anchor',
      description: 'Include a protein source like dal, paneer, or eggs in every major meal to stay full longer.',
    });
  } else if (user?.fitnessGoal === 'muscle_building') {
    plan.tips.push({
      title: 'Recovery reminder',
      description: 'Prioritise a protein + carb combo within 60 minutes post workout for better recovery.',
    });
  }

  if (plan.focus?.tip) {
    plan.tips.unshift({ title: 'Focus insight', description: plan.focus.tip });
  }

  return plan;
};
