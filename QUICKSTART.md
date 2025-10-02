# DIET Track - Quick Start Guide

Get up and running in 5 minutes!

## Prerequisites

- Node.js (v14+)
- MongoDB (local or Atlas)

## Quick Setup

### 1. Install Dependencies

```bash
# Backend
cd backend
npm install

# Frontend (in a new terminal)
cd frontend
npm install
```

### 2. Configure Environment

Backend `.env` is already configured with defaults. For MongoDB Atlas, update:
```
MONGODB_URI=your_mongodb_atlas_connection_string
```

### 3. Seed Database

```bash
cd backend
npm run seed
```

This creates:
- Sample food items with nutrition data
- Admin user: `admin@diettrack.com` / `admin123`

### 4. Start Servers

**Terminal 1 - Backend:**
```bash
cd backend
npm start
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm start
```

### 5. Access Application

Open browser: `http://localhost:3000`

**Login Options:**
- Create new account
- Use admin: `admin@diettrack.com` / `admin123`

## What's Next?

1. **Complete Profile** - Add your health information
2. **Track Meals** - Log your daily food intake
3. **View Dashboard** - See your nutrition analytics
4. **Get Recommendations** - Based on your health profile

## Common Commands

```bash
# Backend
npm start          # Start server
npm run dev        # Start with auto-reload
npm run seed       # Seed database

# Frontend
npm start          # Start development server
npm run build      # Build for production
```

## Troubleshooting

**MongoDB Connection Error?**
- Make sure MongoDB is running
- Check connection string in `.env`

**Port Already in Use?**
- Backend: Change PORT in `.env`
- Frontend: It will prompt for alternate port

**Can't Login?**
- Run seed script: `npm run seed` in backend
- Try creating a new account

## Features Overview

✅ **BMI Calculator** - Track your Body Mass Index
✅ **Meal Tracking** - Log meals with detailed nutrition
✅ **Health Conditions** - Personalized for 12+ conditions
✅ **Fitness Goals** - Weight loss, gain, muscle building
✅ **Visual Analytics** - Charts and graphs
✅ **Admin Panel** - Manage food database
✅ **Recommendations** - Health-condition-aware suggestions

## Tech Stack

- **Frontend:** React + Tailwind CSS + Chart.js
- **Backend:** Node.js + Express
- **Database:** MongoDB + Mongoose
- **Auth:** JWT tokens

## Need Help?

- Check `SETUP.md` for detailed instructions
- Check `DEPLOYMENT.md` for production deployment
- Review console logs for errors

## Default Admin Credentials

```
Email: admin@diettrack.com
Password: admin123
```

**⚠️ Change this password in production!**
