require('dotenv').config();
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const FoodItem = require('../models/foodItem.model');
const User = require('../models/user.model');

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log('MongoDB connected for seeding'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Sample food items with comprehensive nutrition data
const foodItems = [
  // Grains
  {
    name: 'White Rice (Cooked)',
    description: 'Plain cooked white rice',
    category: 'grains',
    servingSize: { amount: 100, unit: 'g', description: '1/2 cup cooked' },
    nutrition: {
      calories: 130,
      protein: 2.7,
      carbs: { total: 28.2, fiber: 0.4, sugar: 0.1 },
      fat: { total: 0.3, saturated: 0.1, trans: 0 },
      sodium: 1,
      potassium: 35,
    },
    suitableFor: [
      { condition: 'vegetarian' },
      { condition: 'vegan' },
      { condition: 'celiac_gluten_free' },
    ],
    isCommon: true,
    isVerified: true,
  },
  {
    name: 'Brown Rice (Cooked)',
    description: 'Whole grain brown rice',
    category: 'grains',
    servingSize: { amount: 100, unit: 'g', description: '1/2 cup cooked' },
    nutrition: {
      calories: 112,
      protein: 2.6,
      carbs: { total: 23.5, fiber: 1.8, sugar: 0.4 },
      fat: { total: 0.9, saturated: 0.2, trans: 0 },
      sodium: 5,
      potassium: 43,
      minerals: { magnesium: 43, phosphorus: 83 },
    },
    suitableFor: [
      { condition: 'diabetes', notes: 'Better choice than white rice due to lower GI' },
      { condition: 'high_cholesterol' },
      { condition: 'vegetarian' },
      { condition: 'vegan' },
      { condition: 'celiac_gluten_free' },
    ],
    isCommon: true,
    isVerified: true,
  },
  {
    name: 'Chapati (Whole Wheat)',
    description: 'Indian whole wheat flatbread',
    category: 'grains',
    servingSize: { amount: 40, unit: 'g', description: '1 medium chapati' },
    nutrition: {
      calories: 104,
      protein: 3.5,
      carbs: { total: 18.0, fiber: 2.8, sugar: 0.5 },
      fat: { total: 2.0, saturated: 0.4, trans: 0 },
      sodium: 120,
      potassium: 115,
    },
    suitableFor: [
      { condition: 'vegetarian' },
      { condition: 'vegan' },
    ],
    notSuitableFor: [
      { condition: 'celiac_gluten_free', reason: 'Contains gluten' },
    ],
    isCommon: true,
    isVerified: true,
  },
  {
    name: 'Oats',
    description: 'Rolled oats',
    category: 'grains',
    servingSize: { amount: 40, unit: 'g', description: '1/2 cup dry' },
    nutrition: {
      calories: 150,
      protein: 5.3,
      carbs: { total: 27.0, fiber: 4.0, sugar: 0.4 },
      fat: { total: 2.8, saturated: 0.5, trans: 0 },
      sodium: 2,
      potassium: 143,
      minerals: { iron: 1.7, magnesium: 56 },
    },
    suitableFor: [
      { condition: 'diabetes', notes: 'Low GI, helps control blood sugar' },
      { condition: 'high_cholesterol', notes: 'Contains beta-glucan that lowers cholesterol' },
      { condition: 'heart_disease' },
      { condition: 'vegetarian' },
      { condition: 'vegan' },
    ],
    isCommon: true,
    isVerified: true,
  },

  // Proteins
  {
    name: 'Chicken Breast (Cooked)',
    description: 'Skinless, boneless chicken breast',
    category: 'proteins',
    servingSize: { amount: 100, unit: 'g', description: '3.5 oz' },
    nutrition: {
      calories: 165,
      protein: 31.0,
      carbs: { total: 0, fiber: 0, sugar: 0 },
      fat: { total: 3.6, saturated: 1.0, trans: 0 },
      cholesterol: 85,
      sodium: 74,
      potassium: 256,
    },
    suitableFor: [
      { condition: 'diabetes' },
      { condition: 'high_blood_pressure' },
    ],
    notSuitableFor: [
      { condition: 'vegetarian', reason: 'Contains meat' },
      { condition: 'vegan', reason: 'Contains meat' },
    ],
    isCommon: true,
    isVerified: true,
  },
  {
    name: 'Dal (Cooked Lentils)',
    description: 'Cooked yellow or red lentils',
    category: 'proteins',
    servingSize: { amount: 100, unit: 'g', description: '1/2 cup cooked' },
    nutrition: {
      calories: 116,
      protein: 9.0,
      carbs: { total: 20.0, fiber: 8.0, sugar: 1.8 },
      fat: { total: 0.4, saturated: 0.1, trans: 0 },
      sodium: 2,
      potassium: 369,
      minerals: { iron: 3.3, magnesium: 36 },
    },
    suitableFor: [
      { condition: 'diabetes', notes: 'High fiber, low GI' },
      { condition: 'high_cholesterol' },
      { condition: 'heart_disease' },
      { condition: 'vegetarian' },
      { condition: 'vegan' },
      { condition: 'celiac_gluten_free' },
    ],
    isCommon: true,
    isVerified: true,
  },
  {
    name: 'Paneer',
    description: 'Indian cottage cheese',
    category: 'proteins',
    servingSize: { amount: 100, unit: 'g', description: '3.5 oz' },
    nutrition: {
      calories: 265,
      protein: 18.3,
      carbs: { total: 1.2, fiber: 0, sugar: 1.2 },
      fat: { total: 20.8, saturated: 11.2, trans: 0 },
      cholesterol: 56,
      sodium: 18,
      calcium: 208,
    },
    suitableFor: [
      { condition: 'vegetarian' },
      { condition: 'celiac_gluten_free' },
    ],
    notSuitableFor: [
      { condition: 'vegan', reason: 'Contains dairy' },
      { condition: 'lactose_intolerance', reason: 'Contains lactose' },
      { condition: 'high_cholesterol', reason: 'High in saturated fat' },
    ],
    isCommon: true,
    isVerified: true,
  },
  {
    name: 'Eggs (Boiled)',
    description: 'Hard boiled chicken eggs',
    category: 'proteins',
    servingSize: { amount: 50, unit: 'g', description: '1 large egg' },
    nutrition: {
      calories: 78,
      protein: 6.3,
      carbs: { total: 0.6, fiber: 0, sugar: 0.6 },
      fat: { total: 5.3, saturated: 1.6, trans: 0 },
      cholesterol: 186,
      sodium: 62,
      potassium: 63,
      vitamins: { a: 270, d: 41, b12: 0.6 },
    },
    suitableFor: [
      { condition: 'vegetarian' },
      { condition: 'diabetes' },
      { condition: 'high_cholesterol' },
    ],
    notSuitableFor: [
      { condition: 'vegan', reason: 'Contains eggs' },
    ],
    isCommon: true,
    isVerified: true,
  },
  {
    name: 'Tofu',
    description: 'Firm tofu',
    category: 'proteins',
    servingSize: { amount: 100, unit: 'g', description: '3.5 oz' },
    nutrition: {
      calories: 76,
      protein: 8.0,
      carbs: { total: 1.9, fiber: 0.3, sugar: 0.7 },
      fat: { total: 4.8, saturated: 0.7, trans: 0 },
      sodium: 7,
      calcium: 350,
      minerals: { iron: 5.4, magnesium: 30 },
    },
    suitableFor: [
      { condition: 'vegetarian' },
      { condition: 'vegan' },
      { condition: 'diabetes' },
      { condition: 'high_cholesterol' },
      { condition: 'celiac_gluten_free' },
    ],
    isCommon: true,
    isVerified: true,
  },

  // Vegetables
  {
    name: 'Spinach (Cooked)',
    description: 'Cooked spinach',
    category: 'vegetables',
    servingSize: { amount: 100, unit: 'g', description: '1/2 cup cooked' },
    nutrition: {
      calories: 23,
      protein: 2.9,
      carbs: { total: 3.6, fiber: 2.2, sugar: 0.4 },
      fat: { total: 0.3, saturated: 0, trans: 0 },
      sodium: 70,
      potassium: 466,
      vitamins: { a: 9377, c: 9.8, k: 493 },
      minerals: { iron: 2.7, calcium: 136, magnesium: 87 },
    },
    suitableFor: [
      { condition: 'diabetes' },
      { condition: 'high_blood_pressure' },
      { condition: 'heart_disease' },
      { condition: 'vegetarian' },
      { condition: 'vegan' },
      { condition: 'celiac_gluten_free' },
    ],
    isCommon: true,
    isVerified: true,
  },
  {
    name: 'Broccoli (Cooked)',
    description: 'Steamed broccoli',
    category: 'vegetables',
    servingSize: { amount: 100, unit: 'g', description: '1/2 cup cooked' },
    nutrition: {
      calories: 35,
      protein: 2.4,
      carbs: { total: 7.2, fiber: 3.3, sugar: 1.4 },
      fat: { total: 0.4, saturated: 0.1, trans: 0 },
      sodium: 41,
      potassium: 293,
      vitamins: { a: 623, c: 64.9, k: 141 },
      minerals: { calcium: 40, iron: 0.7 },
    },
    suitableFor: [
      { condition: 'diabetes' },
      { condition: 'high_cholesterol' },
      { condition: 'heart_disease' },
      { condition: 'vegetarian' },
      { condition: 'vegan' },
      { condition: 'celiac_gluten_free' },
    ],
    isCommon: true,
    isVerified: true,
  },
  {
    name: 'Tomato',
    description: 'Fresh raw tomato',
    category: 'vegetables',
    servingSize: { amount: 100, unit: 'g', description: '1 medium tomato' },
    nutrition: {
      calories: 18,
      protein: 0.9,
      carbs: { total: 3.9, fiber: 1.2, sugar: 2.6 },
      fat: { total: 0.2, saturated: 0, trans: 0 },
      sodium: 5,
      potassium: 237,
      vitamins: { a: 833, c: 13.7, k: 7.9 },
    },
    suitableFor: [
      { condition: 'diabetes' },
      { condition: 'high_blood_pressure' },
      { condition: 'heart_disease' },
      { condition: 'vegetarian' },
      { condition: 'vegan' },
      { condition: 'celiac_gluten_free' },
    ],
    isCommon: true,
    isVerified: true,
  },

  // Fruits
  {
    name: 'Banana',
    description: 'Fresh banana',
    category: 'fruits',
    servingSize: { amount: 100, unit: 'g', description: '1 medium banana' },
    nutrition: {
      calories: 89,
      protein: 1.1,
      carbs: { total: 22.8, fiber: 2.6, sugar: 12.2 },
      fat: { total: 0.3, saturated: 0.1, trans: 0 },
      sodium: 1,
      potassium: 358,
      vitamins: { c: 8.7, b6: 0.4 },
    },
    suitableFor: [
      { condition: 'high_blood_pressure', notes: 'High in potassium' },
      { condition: 'vegetarian' },
      { condition: 'vegan' },
      { condition: 'celiac_gluten_free' },
    ],
    notSuitableFor: [
      { condition: 'diabetes', reason: 'High in natural sugars, consume in moderation' },
    ],
    isCommon: true,
    isVerified: true,
  },
  {
    name: 'Apple',
    description: 'Fresh apple with skin',
    category: 'fruits',
    servingSize: { amount: 100, unit: 'g', description: '1 small apple' },
    nutrition: {
      calories: 52,
      protein: 0.3,
      carbs: { total: 13.8, fiber: 2.4, sugar: 10.4 },
      fat: { total: 0.2, saturated: 0, trans: 0 },
      sodium: 1,
      potassium: 107,
      vitamins: { c: 4.6 },
    },
    suitableFor: [
      { condition: 'diabetes', notes: 'Moderate GI, good fiber content' },
      { condition: 'high_cholesterol' },
      { condition: 'vegetarian' },
      { condition: 'vegan' },
      { condition: 'celiac_gluten_free' },
    ],
    isCommon: true,
    isVerified: true,
  },

  // Dairy
  {
    name: 'Milk (Whole)',
    description: 'Whole cow\'s milk',
    category: 'dairy',
    servingSize: { amount: 240, unit: 'ml', description: '1 cup' },
    nutrition: {
      calories: 149,
      protein: 7.7,
      carbs: { total: 11.7, fiber: 0, sugar: 12.3 },
      fat: { total: 7.9, saturated: 4.6, trans: 0 },
      cholesterol: 24,
      sodium: 105,
      calcium: 276,
      vitamins: { a: 395, d: 124, b12: 1.1 },
    },
    suitableFor: [
      { condition: 'vegetarian' },
    ],
    notSuitableFor: [
      { condition: 'vegan', reason: 'Contains dairy' },
      { condition: 'lactose_intolerance', reason: 'Contains lactose' },
      { condition: 'high_cholesterol', reason: 'Contains saturated fat' },
    ],
    isCommon: true,
    isVerified: true,
  },
  {
    name: 'Yogurt (Plain)',
    description: 'Plain low-fat yogurt',
    category: 'dairy',
    servingSize: { amount: 100, unit: 'g', description: '1/2 cup' },
    nutrition: {
      calories: 63,
      protein: 5.3,
      carbs: { total: 7.0, fiber: 0, sugar: 7.0 },
      fat: { total: 1.6, saturated: 1.0, trans: 0 },
      cholesterol: 6,
      sodium: 70,
      calcium: 183,
      vitamins: { b12: 0.6 },
    },
    suitableFor: [
      { condition: 'vegetarian' },
      { condition: 'diabetes', notes: 'Choose unsweetened varieties' },
    ],
    notSuitableFor: [
      { condition: 'vegan', reason: 'Contains dairy' },
      { condition: 'lactose_intolerance', reason: 'Contains lactose' },
    ],
    isCommon: true,
    isVerified: true,
  },

  // Fats
  {
    name: 'Olive Oil',
    description: 'Extra virgin olive oil',
    category: 'fats',
    servingSize: { amount: 14, unit: 'g', description: '1 tablespoon' },
    nutrition: {
      calories: 119,
      protein: 0,
      carbs: { total: 0, fiber: 0, sugar: 0 },
      fat: { total: 13.5, saturated: 1.9, trans: 0, monounsaturated: 9.9, polyunsaturated: 1.4 },
      sodium: 0,
      vitamins: { e: 1.9, k: 8.1 },
    },
    suitableFor: [
      { condition: 'heart_disease', notes: 'Rich in monounsaturated fats' },
      { condition: 'high_cholesterol' },
      { condition: 'diabetes' },
      { condition: 'vegetarian' },
      { condition: 'vegan' },
      { condition: 'celiac_gluten_free' },
    ],
    isCommon: true,
    isVerified: true,
  },
  {
    name: 'Almonds',
    description: 'Raw almonds',
    category: 'fats',
    servingSize: { amount: 28, unit: 'g', description: '1 oz (about 23 almonds)' },
    nutrition: {
      calories: 164,
      protein: 6.0,
      carbs: { total: 6.1, fiber: 3.5, sugar: 1.2 },
      fat: { total: 14.2, saturated: 1.1, trans: 0, monounsaturated: 8.9, polyunsaturated: 3.5 },
      sodium: 0,
      potassium: 208,
      vitamins: { e: 7.3 },
      minerals: { calcium: 76, iron: 1.1, magnesium: 76 },
    },
    suitableFor: [
      { condition: 'diabetes', notes: 'Low GI, helps control blood sugar' },
      { condition: 'high_cholesterol' },
      { condition: 'heart_disease' },
      { condition: 'vegetarian' },
      { condition: 'vegan' },
      { condition: 'celiac_gluten_free' },
    ],
    isCommon: true,
    isVerified: true,
  },

  // Beverages
  {
    name: 'Green Tea',
    description: 'Brewed green tea (unsweetened)',
    category: 'beverages',
    servingSize: { amount: 240, unit: 'ml', description: '1 cup' },
    nutrition: {
      calories: 2,
      protein: 0,
      carbs: { total: 0, fiber: 0, sugar: 0 },
      fat: { total: 0, saturated: 0, trans: 0 },
      sodium: 2,
      potassium: 19,
    },
    suitableFor: [
      { condition: 'diabetes' },
      { condition: 'high_cholesterol' },
      { condition: 'heart_disease' },
      { condition: 'vegetarian' },
      { condition: 'vegan' },
      { condition: 'celiac_gluten_free' },
    ],
    isCommon: true,
    isVerified: true,
  },

  // Sweets
  {
    name: 'Dark Chocolate (70-85% cocoa)',
    description: 'Dark chocolate bar',
    category: 'sweets',
    servingSize: { amount: 28, unit: 'g', description: '1 oz (about 3 squares)' },
    nutrition: {
      calories: 168,
      protein: 2.2,
      carbs: { total: 13.0, fiber: 3.1, sugar: 6.8 },
      fat: { total: 12.0, saturated: 7.0, trans: 0 },
      sodium: 6,
      potassium: 200,
      minerals: { iron: 3.4, magnesium: 64 },
    },
    suitableFor: [
      { condition: 'vegetarian' },
    ],
    notSuitableFor: [
      { condition: 'diabetes', reason: 'Contains sugar, consume in moderation' },
    ],
    isCommon: true,
    isVerified: true,
  },
];

const csvFilePath = path.join(__dirname, '..', '..', 'indian_food_nutrition_520.csv');

const categoryMap = {
  'regional specialty': 'other',
  fruit: 'fruits',
  'breakfast/tiffin': 'grains',
  'bread/roti': 'grains',
  'salad/side': 'vegetables',
  beverage: 'beverages',
  'sweets/dessert': 'sweets',
  'snack/street food': 'other',
  'meat/seafood': 'proteins',
  'rice dish': 'grains',
};

const toNumber = (value, fallback = 0) => {
  if (value === undefined || value === null || value === '') return fallback;
  const cleaned = String(value).replace(/[^0-9.-]/g, '');
  const num = parseFloat(cleaned);
  return Number.isFinite(num) ? parseFloat(num.toFixed(2)) : fallback;
};

const buildDescription = (row) => {
  const parts = [];
  if (row['Key_vitamins_minerals']) {
    parts.push(`Key vitamins/minerals: ${row['Key_vitamins_minerals']}`);
  }
  if (row.Notes) {
    parts.push(row.Notes);
  }
  return parts.join(' | ') || undefined;
};

const loadCsvFoodItems = () =>
  new Promise((resolve) => {
    if (!fs.existsSync(csvFilePath)) {
      console.warn(`Food dataset not found at ${csvFilePath}. Skipping CSV import.`);
      return resolve([]);
    }

    const items = [];
    const seenNames = new Set();

    fs.createReadStream(csvFilePath)
      .pipe(csv())
      .on('data', (row) => {
        try {
          const name = row.Item?.trim();
          if (!name) return;

          const nameKey = name.toLowerCase();
          if (seenNames.has(nameKey)) return;

          const rawCategory = row.Category?.trim().toLowerCase();
          const category = categoryMap[rawCategory] || 'other';
          const servingAmount = toNumber(row.Serving_g, 100) || 100;
          const description = buildDescription(row);

          const foodItem = {
            name,
            ...(description ? { description } : {}),
            category,
            servingSize: {
              amount: servingAmount > 0 ? servingAmount : 100,
              unit: 'g',
              description: 'Per 100 g serving',
            },
            nutrition: {
              calories: toNumber(row.Calories_kcal_per_100g),
              protein: toNumber(row.Protein_g_per_100g),
              carbs: {
                total: toNumber(row.Carbs_g_per_100g),
                fiber: toNumber(row.Fiber_g_per_100g),
                sugar: toNumber(row.Sugars_g_per_100g),
              },
              fat: {
                total: toNumber(row.Fat_g_per_100g),
                saturated: 0,
                trans: 0,
                monounsaturated: 0,
                polyunsaturated: 0,
              },
              cholesterol: 0,
              sodium: toNumber(row.Sodium_mg_per_100g),
              potassium: 0,
            },
            suitableFor: [],
            notSuitableFor: [],
            isCommon: false,
            isVerified: false,
          };

          items.push(foodItem);
          seenNames.add(nameKey);
        } catch (error) {
          console.error('Error parsing CSV row:', error);
        }
      })
      .on('end', () => {
        console.log(`Loaded ${items.length} food items from CSV dataset`);
        resolve(items);
      })
      .on('error', (error) => {
        console.error('Error reading CSV file:', error);
        resolve([]);
      });
  });

// Seed function
const seedDatabase = async () => {
  try {
    const csvFoodItems = await loadCsvFoodItems();
    const existingNames = new Set(
      foodItems.map((item) => item.name.toLowerCase())
    );

    const dedupedCsvItems = csvFoodItems.filter((item) => {
      const key = item.name.toLowerCase();
      if (existingNames.has(key)) {
        return false;
      }
      existingNames.add(key);
      return true;
    });

    const itemsToInsert = [...foodItems, ...dedupedCsvItems];

    // Clear existing food items
    await FoodItem.deleteMany({});
    console.log('Cleared existing food items');

    // Insert new food items
    if (itemsToInsert.length > 0) {
      const insertedFoods = await FoodItem.insertMany(itemsToInsert);
      console.log(
        `Inserted ${insertedFoods.length} food items (base: ${foodItems.length}, csv: ${dedupedCsvItems.length})`
      );
    } else {
      console.warn('No food items to insert.');
    }

    // Create a default admin user if it doesn't exist
    const adminEmail = 'admin@diettrack.com';
    let adminUser = await User.findOne({ email: adminEmail });
    
    if (!adminUser) {
      adminUser = new User({
        name: 'Admin User',
        email: adminEmail,
        password: 'admin123', // This will be hashed by the pre-save hook
        isAdmin: true,
      });
      await adminUser.save();
      console.log('Created default admin user');
      console.log('Email: admin@diettrack.com');
      console.log('Password: admin123');
    } else {
      console.log('Admin user already exists');
    }

    console.log('Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

// Run the seed function
seedDatabase();
