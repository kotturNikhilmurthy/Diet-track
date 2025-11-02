# Deployment Guide for DIET Track

## ✅ Pre-Deployment Checklist Completed

- [x] Email functionality working
- [x] .gitignore protecting sensitive files
- [x] .env.example created for reference
- [x] All features tested

## 🚀 Ready to Deploy!

### Step 1: Initialize Git Repository (if not already done)

```bash
cd "C:\Users\kakhi\OneDrive\Desktop\DIET TRACK\diet-track"
git init
git add .
git commit -m "Initial commit: DIET Track application with email functionality"
```

### Step 2: Push to GitHub

```bash
# Create a new repository on GitHub, then:
git remote add origin https://github.com/YOUR_USERNAME/diet-track.git
git branch -M main
git push -u origin main
```

## 📦 Deployment Options

### Option 1: Render (Recommended - Free Tier Available)

**Backend Deployment:**
1. Go to https://render.com and sign up
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Configure:
   - Name: `diet-track-backend`
   - Root Directory: `backend`
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Add Environment Variables (from your .env file):
     - `MONGODB_URI`
     - `JWT_SECRET`
     - `NODE_ENV=production`
     - `GROQ_API_KEY`
     - `GROQ_MODEL_ID`
     - `EMAIL_USER`
     - `EMAIL_PASS`
     - `EMAIL_FROM`
     - `FRONTEND_URL` (will be your frontend URL)
     - `GOOGLE_CLIENT_ID`
     - `GOOGLE_CLIENT_SECRET`
     - `GOOGLE_CALLBACK_URL` (update with your backend URL)

**Frontend Deployment:**
1. Click "New +" → "Static Site"
2. Connect your GitHub repository
3. Configure:
   - Name: `diet-track-frontend`
   - Root Directory: `frontend`
   - Build Command: `npm install && npm run build`
   - Publish Directory: `build`
   - Add Environment Variable:
     - `REACT_APP_API_URL` (your backend URL from above)

### Option 2: Vercel (Frontend) + Render (Backend)

**Backend:** Follow Render instructions above

**Frontend:**
1. Go to https://vercel.com
2. Import your GitHub repository
3. Configure:
   - Root Directory: `frontend`
   - Build Command: `npm run build`
   - Output Directory: `build`
   - Environment Variable: `REACT_APP_API_URL`

### Option 3: Railway (Full Stack)

1. Go to https://railway.app
2. Create new project from GitHub
3. Add services for both backend and frontend
4. Configure environment variables

## 🔧 Post-Deployment Configuration

1. **Update CORS in backend:**
   - Add your frontend domain to CORS whitelist in `server.js`

2. **Update Google OAuth callback:**
   - Go to Google Cloud Console
   - Update callback URL to your deployed backend URL

3. **Test email functionality:**
   - Send a test email from the deployed app

## 📝 Important Notes

- **MongoDB Atlas:** Make sure your MongoDB Atlas IP whitelist includes `0.0.0.0/0` for cloud deployments
- **Environment Variables:** Never commit `.env` file to git (already in .gitignore)
- **Gmail App Password:** Keep this secure and only use in environment variables
- **API Keys:** Rotate keys if accidentally exposed

## 🎯 Your Current Configuration

- ✅ MongoDB: Cloud (Atlas)
- ✅ Email: Gmail configured
- ✅ AI Assistant: Groq API
- ✅ Auth: JWT + Google OAuth
- ✅ Admin Portal: Configured for k.nikhilmurthy2005@gmail.com

## 🔐 Security Reminders

1. Keep your `.env` file secure and never commit it
2. Use strong JWT_SECRET in production
3. Keep Gmail app password secure
4. Regularly rotate API keys
5. Monitor MongoDB Atlas for unusual activity

---

**You're ready to deploy! 🚀**
