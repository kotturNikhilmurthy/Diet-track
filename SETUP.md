# DIET Track - Setup Instructions

This guide will help you set up and run the DIET Track application locally.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v14 or higher) - [Download here](https://nodejs.org/)
- **npm** (comes with Node.js) or **yarn**
- **MongoDB** - Either:
  - Local installation - [Download here](https://www.mongodb.com/try/download/community)
  - OR MongoDB Atlas (cloud) - [Sign up here](https://www.mongodb.com/cloud/atlas)

## Project Structure

```
diet-track/
├── backend/           # Node.js + Express backend
│   ├── controllers/   # Route controllers
│   ├── models/        # MongoDB models
│   ├── routes/        # API routes
│   ├── middleware/    # Custom middleware
│   ├── seeds/         # Database seed data
│   └── server.js      # Server entry point
├── frontend/          # React frontend
│   ├── public/        # Static files
│   └── src/           # React source code
│       ├── components/
│       ├── pages/
│       ├── context/
│       ├── utils/
│       └── App.js
└── README.md
```

## Step 1: MongoDB Setup

### Option A: Local MongoDB

1. Install MongoDB Community Edition
2. Start MongoDB service:
   ```bash
   # Windows
   net start MongoDB
   
   # macOS/Linux
   sudo systemctl start mongod
   ```
3. MongoDB will run on `mongodb://localhost:27017`

### Option B: MongoDB Atlas (Cloud)

1. Create a free account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a new cluster
3. Create a database user
4. Whitelist your IP address (or use 0.0.0.0/0 for development)
5. Get your connection string (looks like: `mongodb+srv://username:password@cluster.mongodb.net/diet-track`)

## Step 2: Backend Setup

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment variables:**
   
   The `.env` file is already created with default values. Update it if needed:
   ```
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/diet-track
   JWT_SECRET=diet_track_jwt_secret_2023
   NODE_ENV=development
   ```

   For MongoDB Atlas, update `MONGODB_URI`:
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/diet-track
   ```

4. **Seed the database:**
   ```bash
   npm run seed
   ```
   
   This will:
   - Clear existing food items
   - Insert sample food items with nutrition data
   - Create a default admin user:
     - Email: `admin@diettrack.com`
     - Password: `admin123`

5. **Start the backend server:**
   ```bash
   npm start
   ```
   
   Or for development with auto-reload:
   ```bash
   npm run dev
   ```

   The backend will run on `http://localhost:5000`

## Step 3: Frontend Setup

1. **Open a new terminal and navigate to frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the frontend development server:**
   ```bash
   npm start
   ```

   The frontend will run on `http://localhost:3000` and automatically open in your browser.

## Step 4: Access the Application

1. **Open your browser and go to:** `http://localhost:3000`

2. **You can either:**
   - Create a new account by clicking "Get Started" or "Sign Up"
   - Login with the admin account:
     - Email: `admin@diettrack.com`
     - Password: `admin123`

3. **Complete your profile:**
   - Add your age, weight, height
   - Select your gender and activity level
   - Choose your fitness goal
   - Select any health conditions

4. **Start using the app:**
   - Track meals
   - View BMI and nutrition analytics
   - Get personalized recommendations
   - (Admin only) Manage food database

## Troubleshooting

### Backend won't start

**Problem:** `Error: Cannot find module`
- **Solution:** Run `npm install` in the backend directory

**Problem:** `MongooseServerSelectionError: connect ECONNREFUSED`
- **Solution:** Make sure MongoDB is running
  - For local: Start MongoDB service
  - For Atlas: Check your connection string and network access

**Problem:** Port 5000 already in use
- **Solution:** Either:
  - Stop the process using port 5000
  - Change the PORT in `.env` file

### Frontend won't start

**Problem:** `Error: Cannot find module`
- **Solution:** Run `npm install` in the frontend directory

**Problem:** API calls failing
- **Solution:** Make sure the backend is running on port 5000

**Problem:** CORS errors
- **Solution:** The backend is already configured for CORS. Make sure both servers are running.

### Database issues

**Problem:** No food items showing up
- **Solution:** Run the seed script: `npm run seed` in the backend directory

**Problem:** Can't login
- **Solution:** 
  - Check MongoDB is running
  - Verify the connection string in `.env`
  - Try creating a new account

## Default Credentials

After seeding the database, you can login with:

- **Admin Account:**
  - Email: `admin@diettrack.com`
  - Password: `admin123`
  - Has access to Admin Panel for managing food items

## API Endpoints

The backend provides the following API endpoints:

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/me` - Update user profile

### Users
- `GET /api/users/me` - Get user profile
- `PUT /api/users/me` - Update user profile
- `GET /api/users/health-conditions` - Get health conditions list
- `GET /api/users/recommendations` - Get personalized recommendations

### Meals
- `GET /api/meals` - Get user's meals
- `POST /api/meals` - Create new meal
- `GET /api/meals/:id` - Get specific meal
- `PUT /api/meals/:id` - Update meal
- `DELETE /api/meals/:id` - Delete meal
- `GET /api/meals/summary/daily` - Get daily summary
- `GET /api/meals/summary/meal-types` - Get meal type breakdown

### Foods
- `GET /api/foods` - Get all food items
- `GET /api/foods/:id` - Get specific food item
- `GET /api/foods/search/:query` - Search food items
- `GET /api/foods/categories` - Get food categories
- `POST /api/foods` - Create food item (Admin only)
- `PUT /api/foods/:id` - Update food item (Admin only)
- `DELETE /api/foods/:id` - Delete food item (Admin only)

## Next Steps

1. **Customize the food database:**
   - Login as admin
   - Go to Admin Panel
   - Add more food items relevant to your region

2. **Deploy to production:**
   - See DEPLOYMENT.md for deployment instructions

3. **Backup your data:**
   - Regularly backup your MongoDB database
   - Export important data

## Support

If you encounter any issues:

1. Check the console for error messages
2. Verify all prerequisites are installed
3. Make sure both backend and frontend are running
4. Check MongoDB connection
5. Review the troubleshooting section above

## Development Tips

- Backend runs on port 5000
- Frontend runs on port 3000
- Frontend proxies API requests to backend (configured in package.json)
- Hot reload is enabled for both frontend and backend (with nodemon)
- Use Chrome DevTools for debugging frontend
- Check terminal/console for backend logs
