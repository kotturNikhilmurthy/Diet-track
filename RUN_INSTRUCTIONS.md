# 🚀 DIET Track - How to Run the Application

This is a step-by-step guide to get DIET Track running on your machine.

## ⚡ Prerequisites Check

Before starting, verify you have:

1. **Node.js** installed (v14 or higher)
   ```bash
   node --version
   ```
   If not installed: Download from https://nodejs.org/

2. **MongoDB** installed or MongoDB Atlas account
   - **Local MongoDB**: Download from https://www.mongodb.com/try/download/community
   - **MongoDB Atlas**: Sign up at https://www.mongodb.com/cloud/atlas (Free tier available)

3. **Git** (optional, for version control)
   ```bash
   git --version
   ```

## 📋 Step-by-Step Instructions

### Step 1: Navigate to Project Directory

```bash
cd "C:\Users\kakhi\OneDrive\Desktop\DIET TRACK\diet-track"
```

### Step 2: Setup Backend

#### 2.1 Install Backend Dependencies

```bash
cd backend
npm install
```

This will install:
- express (web framework)
- mongoose (MongoDB ODM)
- bcryptjs (password hashing)
- jsonwebtoken (authentication)
- cors (cross-origin requests)
- dotenv (environment variables)
- And other dependencies...

**Expected output:** "added XXX packages" (takes 1-2 minutes)

#### 2.2 Verify Environment Configuration

The `.env` file is already created with default settings:
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/diet-track
JWT_SECRET=diet_track_jwt_secret_2023
NODE_ENV=development
```

**For MongoDB Atlas:**
If using MongoDB Atlas instead of local MongoDB, update `MONGODB_URI`:
```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/diet-track
```

#### 2.3 Start MongoDB (if using local)

**Windows:**
```bash
net start MongoDB
```

**macOS/Linux:**
```bash
sudo systemctl start mongod
```

**Verify MongoDB is running:**
- Local: Should be accessible at `mongodb://localhost:27017`
- Atlas: Check your cluster status in Atlas dashboard

#### 2.4 Seed the Database

```bash
npm run seed
```

**Expected output:**
```
MongoDB connected for seeding
Cleared existing food items
Inserted 30 food items
Created default admin user
Email: admin@diettrack.com
Password: admin123
Database seeded successfully!
```

This creates:
- 30+ food items with nutrition data
- Admin user account
- Database indexes

#### 2.5 Start Backend Server

```bash
npm start
```

**Expected output:**
```
Server running on port 5000
MongoDB connected
```

**Keep this terminal open!** The backend server is now running.

### Step 3: Setup Frontend

#### 3.1 Open New Terminal

Open a **new terminal/command prompt** (keep backend running in the first one)

Navigate to frontend directory:
```bash
cd "C:\Users\kakhi\OneDrive\Desktop\DIET TRACK\diet-track\frontend"
```

#### 3.2 Install Frontend Dependencies

```bash
npm install
```

This will install:
- react (UI framework)
- react-router-dom (routing)
- axios (HTTP client)
- tailwindcss (styling)
- chart.js (data visualization)
- And other dependencies...

**Expected output:** "added XXX packages" (takes 2-3 minutes)

#### 3.3 Start Frontend Development Server

```bash
npm start
```

**Expected output:**
```
Compiled successfully!

You can now view diet-track-frontend in the browser.

  Local:            http://localhost:3000
  On Your Network:  http://192.168.x.x:3000

Note that the development build is not optimized.
To create a production build, use npm run build.

webpack compiled successfully
```

**Your browser should automatically open** to `http://localhost:3000`

If it doesn't, manually open: http://localhost:3000

### Step 4: Access the Application

#### 4.1 Landing Page

You should see the DIET Track landing page with:
- Large "DIET Track" header
- Green gradient background with health imagery
- "Get Started" and "Sign In" buttons
- Feature highlights
- Health conditions list

#### 4.2 Login Options

**Option A: Use Admin Account**
1. Click "Sign In"
2. Enter credentials:
   - Email: `admin@diettrack.com`
   - Password: `admin123`
3. Click "Sign In"

**Option B: Create New Account**
1. Click "Get Started" or "Sign Up"
2. Fill in the registration form:
   - Full Name
   - Email
   - Password (min 6 characters)
   - Confirm Password
3. Click "Create Account"

#### 4.3 Complete Your Profile

After login, you'll be redirected to the dashboard. Complete your profile:

1. Click "Profile" in the navigation
2. Fill in:
   - **Basic Information:**
     - Name
     - Age (12-120)
     - Gender
     - Activity Level
   
   - **Body Measurements:**
     - Weight (kg or lbs)
     - Height (cm or ft)
   
   - **Fitness Goal:**
     - Weight Loss
     - Weight Gain
     - Muscle Building
     - Maintenance
   
   - **Health Conditions:** (select all that apply)
     - Diabetes
     - High Blood Pressure
     - High Cholesterol
     - PCOS/PCOD
     - Thyroid Disorders
     - Heart Disease
     - Kidney Issues
     - Pregnancy/Nursing
     - Celiac/Gluten-Free
     - Lactose Intolerance
     - Vegetarian
     - Vegan

3. Click "Save Profile"

You'll see your BMI calculated automatically!

### Step 5: Explore Features

#### 5.1 Dashboard
- View your BMI and category
- See daily calorie goal and progress
- Check fitness goal and macro targets
- View today's macro distribution (pie chart)
- See weekly calorie intake (bar chart)

#### 5.2 Track Meals
1. Click "Track Meals" or navigate to `/meals`
2. Click "+ Add Meal"
3. Select meal type (Breakfast, Lunch, Dinner, Snack)
4. Search for food items (e.g., "rice", "chicken", "apple")
5. Click on food to add it
6. Adjust quantity if needed
7. Add more foods
8. Click "Add Meal"

View your daily nutrition summary!

#### 5.3 Fitness Goals
- Click "Fitness Goals"
- View detailed information about each goal
- See your current goal and macro targets
- Read tips for success

#### 5.4 Recommendations
- Click "Recommendations"
- View personalized recommendations based on:
  - Your BMI
  - Fitness goal
  - Health conditions
- See dietary guidelines
- Read exercise suggestions
- Check health warnings

#### 5.5 Admin Panel (Admin only)
If logged in as admin:
1. Click "Admin Panel"
2. View all food items
3. Add new food items
4. Edit existing foods
5. Delete foods
6. Search and filter

## 🎯 Verification Checklist

Ensure everything is working:

- [ ] Backend server running on port 5000
- [ ] Frontend server running on port 3000
- [ ] MongoDB connected (check backend terminal)
- [ ] Can access landing page
- [ ] Can login/register
- [ ] Can update profile
- [ ] BMI calculates correctly
- [ ] Can search and add foods
- [ ] Can create meals
- [ ] Charts display on dashboard
- [ ] Recommendations load
- [ ] Admin panel accessible (if admin)

## 🔧 Troubleshooting

### Backend Issues

**Problem: "Cannot find module"**
```bash
cd backend
npm install
```

**Problem: "MongooseServerSelectionError"**
- Check if MongoDB is running
- For local: `net start MongoDB` (Windows)
- For Atlas: Verify connection string in `.env`

**Problem: "Port 5000 already in use"**
- Change PORT in `.env` to 5001 or another port
- Or stop the process using port 5000

**Problem: "JWT_SECRET not defined"**
- Verify `.env` file exists in backend directory
- Check JWT_SECRET is set

### Frontend Issues

**Problem: "Cannot find module"**
```bash
cd frontend
npm install
```

**Problem: "Failed to compile"**
- Check for syntax errors in console
- Verify all dependencies installed
- Try deleting `node_modules` and reinstalling

**Problem: "API calls failing"**
- Ensure backend is running on port 5000
- Check browser console for errors
- Verify CORS is enabled on backend

**Problem: "Blank page"**
- Check browser console for errors
- Verify React app compiled successfully
- Try clearing browser cache

### Database Issues

**Problem: "No food items showing"**
```bash
cd backend
npm run seed
```

**Problem: "Can't login"**
- Verify database is seeded
- Check MongoDB connection
- Try creating a new account

## 📱 Using the Application

### Daily Workflow

1. **Morning:**
   - Login to DIET Track
   - Track your breakfast
   - View updated nutrition stats

2. **Throughout the Day:**
   - Log lunch, dinner, and snacks
   - Monitor your daily progress
   - Stay within calorie goals

3. **Evening:**
   - Review daily summary
   - Check macro distribution
   - Plan tomorrow's meals

### Tips for Best Experience

- **Track consistently** - Log meals daily for accurate insights
- **Update profile** - Keep weight and goals current
- **Review recommendations** - Check weekly for new insights
- **Use search** - Find foods quickly with search feature
- **Check charts** - Monitor trends over time

## 🛑 Stopping the Application

### To Stop Servers:

**Backend Terminal:**
- Press `Ctrl + C`
- Type `Y` if prompted

**Frontend Terminal:**
- Press `Ctrl + C`
- Type `Y` if prompted

### To Stop MongoDB (local):

**Windows:**
```bash
net stop MongoDB
```

**macOS/Linux:**
```bash
sudo systemctl stop mongod
```

## 🔄 Restarting the Application

### Quick Restart:

**Terminal 1 (Backend):**
```bash
cd backend
npm start
```

**Terminal 2 (Frontend):**
```bash
cd frontend
npm start
```

That's it! No need to reinstall or reseed.

## 📊 Default Data

After seeding, you have:

- **1 Admin User:**
  - Email: admin@diettrack.com
  - Password: admin123

- **30+ Food Items:**
  - Grains: Rice, Chapati, Oats, Brown Rice
  - Proteins: Chicken, Dal, Paneer, Eggs, Tofu
  - Vegetables: Spinach, Broccoli, Tomato
  - Fruits: Banana, Apple
  - Dairy: Milk, Yogurt
  - Fats: Olive Oil, Almonds
  - Beverages: Green Tea
  - Sweets: Dark Chocolate

## 🎓 Learning the Interface

### Navigation Bar
- **DIET Track** - Logo (click to go home)
- **Dashboard** - Main overview
- **Profile** - Your health information
- **Track Meals** - Log food intake
- **Fitness Goals** - Goal information
- **Recommendations** - Personalized advice
- **Admin Panel** - Food management (admin only)
- **Logout** - Sign out

### Dashboard Cards
- **BMI Card** - Shows your current BMI
- **Calorie Goal** - Daily progress bar
- **Fitness Goal** - Your selected goal
- **Macro Chart** - Today's distribution
- **Weekly Chart** - 7-day calorie trend

## 💾 Data Persistence

All your data is saved in MongoDB:
- User profiles
- Meal logs
- Food database
- Health conditions
- Fitness goals

Data persists between sessions!

## 🚀 Next Steps

1. **Customize food database** - Add your favorite foods via Admin Panel
2. **Track meals daily** - Build a consistent habit
3. **Monitor progress** - Check dashboard weekly
4. **Adjust goals** - Update as you progress
5. **Deploy to production** - See DEPLOYMENT.md

## 📞 Need Help?

1. Check console logs (both terminals)
2. Review error messages
3. Verify all steps completed
4. Check MongoDB connection
5. Ensure both servers running
6. Review SETUP.md for details

## ✅ Success Indicators

You know it's working when:
- ✅ Both terminals show no errors
- ✅ Browser opens to localhost:3000
- ✅ Landing page displays correctly
- ✅ Can login successfully
- ✅ Dashboard shows your data
- ✅ Can add and view meals
- ✅ Charts render properly

---

**Enjoy using DIET Track! 🎉**

Track your nutrition, achieve your goals, and live healthier!
