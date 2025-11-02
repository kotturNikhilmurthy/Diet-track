# DIET Track - Your Personal Health & Nutrition Companion

![DIET Track](https://img.shields.io/badge/DIET-Track-green?style=for-the-badge)
![Version](https://img.shields.io/badge/version-1.0.0-blue?style=for-the-badge)
![License](https://img.shields.io/badge/license-MIT-orange?style=for-the-badge)

DIET Track is a comprehensive full-stack health and nutrition tracking platform that helps users monitor their diet, calculate BMI, and receive personalized fitness recommendations based on their health conditions.

## 🌟 Key Features

### 🎯 All-in-One Platform
Unlike many apps that focus only on calorie counting or BMI, DIET Track combines:
- **BMI Calculator** with real-time tracking
- **Meal Tracking** with comprehensive nutrition database
- **Personalized Recommendations** based on health conditions
- **Fitness Goals** with customized macro targets
- **Visual Analytics** with interactive charts

### 🏥 Health-Condition-Aware
Get personalized recommendations for:
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
- Vegetarian/Vegan preferences

### 📊 Smart Features
- **Automatic Calorie Calculation** based on BMR and activity level
- **Macro Tracking** (Protein, Carbs, Fat)
- **Daily/Weekly Analytics** with beautiful charts
- **Food Search** with 30+ pre-loaded Indian and international foods
- **Admin Panel** to manage food database
- **Responsive Design** - works on all devices

## 🚀 Quick Start

### Option 1: Quick Setup (5 minutes)

```bash
# 1. Clone or download the project
cd diet-track

# 2. Install backend dependencies
cd backend
npm install

# 3. Seed the database
npm run seed

# 4. Start backend (Terminal 1)
npm start

# 5. Install frontend dependencies (Terminal 2)
cd ../frontend
npm install

# 6. Start frontend
npm start
```

**Access:** Open `http://localhost:3000`

**Login:** `admin@diettrack.com` / `admin123`

### Option 2: Detailed Setup

See [SETUP.md](SETUP.md) for comprehensive instructions.

## 📋 Prerequisites

- **Node.js** v14 or higher
- **MongoDB** (local or Atlas)
- **npm** or **yarn**

## 🛠️ Tech Stack

### Frontend
- **React.js** - UI framework
- **Tailwind CSS** - Styling
- **Chart.js** - Data visualization
- **React Router** - Navigation
- **Axios** - HTTP client

### Backend
- **Node.js** - Runtime
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **JWT** - Authentication
- **bcrypt** - Password hashing

## 📱 Screenshots & Features

### Landing Page
- Beautiful hero section with health/fitness imagery
- Feature highlights
- Health conditions overview
- Call-to-action buttons

### Authentication
- Secure login and registration
- JWT-based authentication
- Password hashing with bcrypt

### Dashboard
- BMI display with category
- Daily calorie progress
- Fitness goal overview
- Macro distribution chart (Doughnut)
- Weekly calorie chart (Bar)
- Quick action buttons

### Profile Management
- Personal information
- Body measurements (Weight, Height)
- BMI calculator with live preview
- Activity level selection
- Fitness goal setting
- Health conditions (multi-select)

### Meal Tracker
- Date-based meal viewing
- Add meals with food search
- Automatic nutrition calculation
- Meal type categorization (Breakfast, Lunch, Dinner, Snack)
- Daily nutrition summary
- Edit/Delete meals

### Fitness Goals
- Weight Loss
- Weight Gain
- Muscle Building
- Maintenance
- Detailed macro targets
- Success tips

### Recommendations
- General health recommendations
- Dietary guidelines
- Exercise suggestions
- Health condition-specific warnings
- Personalized based on profile

### Admin Panel
- Add/Edit/Delete food items
- Comprehensive nutrition data entry
- Search and filter foods
- Mark foods as common/verified
- Pagination support

## 📁 Project Structure

```
diet-track/
├── backend/
│   ├── controllers/       # Route controllers
│   │   ├── auth.controller.js
│   │   ├── meal.controller.js
│   │   └── food.controller.js
│   ├── models/           # MongoDB models
│   │   ├── user.model.js
│   │   ├── meal.model.js
│   │   └── foodItem.model.js
│   ├── routes/           # API routes
│   │   ├── auth.routes.js
│   │   ├── user.routes.js
│   │   ├── meal.routes.js
│   │   └── food.routes.js
│   ├── middleware/       # Custom middleware
│   │   └── auth.middleware.js
│   ├── seeds/           # Database seed data
│   │   └── seed.js
│   ├── .env             # Environment variables
│   ├── server.js        # Server entry point
│   └── package.json
├── frontend/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/   # Reusable components
│   │   │   ├── Navbar.js
│   │   │   └── Layout.js
│   │   ├── pages/        # Page components
│   │   │   ├── LandingPage.js
│   │   │   ├── LoginPage.js
│   │   │   ├── RegisterPage.js
│   │   │   ├── Dashboard.js
│   │   │   ├── ProfilePage.js
│   │   │   ├── MealTrackerPage.js
│   │   │   ├── FitnessGoalsPage.js
│   │   │   ├── RecommendationsPage.js
│   │   │   └── AdminPage.js
│   │   ├── context/      # React context
│   │   │   └── AuthContext.js
│   │   ├── utils/        # Utility functions
│   │   │   ├── api.js
│   │   │   └── helpers.js
│   │   ├── App.js
│   │   ├── index.js
│   │   └── index.css
│   ├── tailwind.config.js
│   └── package.json
├── README.md
├── SETUP.md
├── DEPLOYMENT.md
└── QUICKSTART.md
```

## 🔐 Default Credentials

After seeding the database:

```
Email: admin@diettrack.com
Password: admin123
```

**⚠️ Important:** Change the admin password immediately in production!

## 📖 Documentation

- **[QUICKSTART.md](QUICKSTART.md)** - Get started in 5 minutes
- **[SETUP.md](SETUP.md)** - Detailed setup instructions
- **[DEPLOYMENT.md](DEPLOYMENT.md)** - Production deployment guide

## 🔌 API Endpoints

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

## 🧪 Testing

```bash
# Backend
cd backend
npm test

# Frontend
cd frontend
npm test
```

## 🚢 Deployment

The application can be deployed to:

- **Frontend:** Vercel, Netlify
- **Backend:** Render, Heroku, Railway
- **Database:** MongoDB Atlas

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed instructions.

## 🎨 Customization

### Adding New Foods
1. Login as admin
2. Navigate to Admin Panel
3. Click "Add Food Item"
4. Fill in nutrition information
5. Save

### Modifying Health Conditions
Edit `backend/models/user.model.js` to add/remove health conditions.

### Changing Theme Colors
Edit `frontend/tailwind.config.js` to customize colors.

## 🐛 Troubleshooting

### Backend won't start
- Ensure MongoDB is running
- Check `.env` configuration
- Verify all dependencies are installed

### Frontend API errors
- Ensure backend is running on port 5000
- Check CORS configuration
- Verify API endpoints

### Database connection issues
- Check MongoDB connection string
- Verify network access (for Atlas)
- Ensure database user has correct permissions

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.

## 👨‍💻 Author

Built with ❤️ for health-conscious individuals

## 🙏 Acknowledgments

- Nutrition data sourced from USDA and Indian food databases
- Icons from Heroicons
- UI inspiration from modern health apps

## 📞 Support

For issues and questions:
- Check documentation files
- Review console logs
- Verify environment configuration

## 🔮 Future Enhancements

- [ ] Mobile app (React Native)
- [ ] Barcode scanner for packaged foods
- [ ] Recipe builder
- [ ] Social features (share meals)
- [ ] Integration with fitness trackers
- [ ] Meal planning and scheduling
- [ ] Shopping list generator
- [ ] Water intake tracking
- [ ] Sleep tracking
- [ ] Export data to PDF/CSV

---

**Made with ❤️ for a healthier tomorrow**

## Project Structure

```
diet-track/
├── frontend/           # React frontend
│   ├── public/         # Static files
│   └── src/            # React source code
│       ├── components/ # Reusable components
│       ├── pages/      # Page components
│       ├── context/    # React context
│       ├── utils/      # Utility functions
│       └── App.js      # Main App component
└── backend/            # Node.js backend
    ├── config/         # Configuration files
    ├── controllers/    # Route controllers
    ├── middleware/     # Custom middleware
    ├── models/         # MongoDB models
    ├── routes/         # API routes
    └── server.js       # Server entry point
```

## Database Schema

### Users
- name: String
- email: String (unique)
- password: String (hashed)
- age: Number
- weight: Number
- height: Number
- healthConditions: [String]
- fitnessGoal: String
- createdAt: Date
- updatedAt: Date

### Meals
- user: ObjectId (ref: User)
- foods: [
  - name: String
  - quantity: Number
  - calories: Number
  - protein: Number
  - carbs: Number
  - fat: Number
]
- date: Date
- mealType: String (breakfast, lunch, dinner, snack)

### FoodItems
- name: String (unique)
- calories: Number
- protein: Number
- carbs: Number
- fat: Number
- suitableFor: [String] (health conditions)

## API Endpoints

### Auth
- POST /api/auth/register - Register a new user
- POST /api/auth/login - Login user
- GET /api/auth/me - Get current user

### User
- GET /api/users/me - Get current user profile
- PUT /api/users/me - Update user profile

### Meals
- GET /api/meals - Get all meals for current user
- POST /api/meals - Add a new meal
- GET /api/meals/:id - Get a specific meal
- PUT /api/meals/:id - Update a meal
- DELETE /api/meals/:id - Delete a meal

### Food Items
- GET /api/foods - Get all food items
- POST /api/foods - Add a new food item (admin only)

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
