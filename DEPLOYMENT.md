# DIET Track - Deployment Guide

This guide provides instructions for deploying the DIET Track application to production.

## Deployment Architecture

- **Frontend:** Vercel or Netlify (Static hosting)
- **Backend:** Render, Heroku, or Railway (Node.js hosting)
- **Database:** MongoDB Atlas (Cloud database)

## Prerequisites

- GitHub account (for code repository)
- MongoDB Atlas account (for database)
- Vercel/Netlify account (for frontend)
- Render/Heroku account (for backend)

---

## Part 1: Database Setup (MongoDB Atlas)

### 1. Create MongoDB Atlas Cluster

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Sign up or login
3. Create a new cluster (Free tier is sufficient)
4. Wait for cluster to be created (2-5 minutes)

### 2. Configure Database Access

1. Go to **Database Access** in the left sidebar
2. Click **Add New Database User**
3. Create a user with username and password
4. Set privileges to "Read and write to any database"
5. Click **Add User**

### 3. Configure Network Access

1. Go to **Network Access** in the left sidebar
2. Click **Add IP Address**
3. For development: Click **Allow Access from Anywhere** (0.0.0.0/0)
4. For production: Add specific IP addresses of your hosting services
5. Click **Confirm**

### 4. Get Connection String

1. Go to **Database** in the left sidebar
2. Click **Connect** on your cluster
3. Choose **Connect your application**
4. Copy the connection string
5. Replace `<password>` with your database user password
6. Replace `<dbname>` with `diet-track`

Example:
```
mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/diet-track?retryWrites=true&w=majority
```

### 5. Seed Production Database

1. Update your local `.env` file with the Atlas connection string
2. Run the seed script:
   ```bash
   cd backend
   npm run seed
   ```
3. Verify data was inserted by checking MongoDB Atlas dashboard

---

## Part 2: Backend Deployment (Render)

### Option A: Deploy to Render

1. **Create Render Account:**
   - Go to [Render](https://render.com)
   - Sign up with GitHub

2. **Push Code to GitHub:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/yourusername/diet-track.git
   git push -u origin main
   ```

3. **Create New Web Service:**
   - Click **New +** → **Web Service**
   - Connect your GitHub repository
   - Configure:
     - **Name:** diet-track-backend
     - **Root Directory:** backend
     - **Environment:** Node
     - **Build Command:** `npm install`
     - **Start Command:** `npm start`
     - **Plan:** Free

4. **Add Environment Variables:**
   - Click **Environment** tab
   - Add the following variables:
     ```
     PORT=5000
     MONGODB_URI=your_mongodb_atlas_connection_string
     JWT_SECRET=your_secure_jwt_secret_here
     NODE_ENV=production
     ```

5. **Deploy:**
   - Click **Create Web Service**
   - Wait for deployment to complete
   - Note your backend URL (e.g., `https://diet-track-backend.onrender.com`)

### Option B: Deploy to Heroku

1. **Install Heroku CLI:**
   ```bash
   npm install -g heroku
   ```

2. **Login to Heroku:**
   ```bash
   heroku login
   ```

3. **Create Heroku App:**
   ```bash
   cd backend
   heroku create diet-track-backend
   ```

4. **Set Environment Variables:**
   ```bash
   heroku config:set MONGODB_URI="your_mongodb_atlas_connection_string"
   heroku config:set JWT_SECRET="your_secure_jwt_secret"
   heroku config:set NODE_ENV=production
   ```

5. **Deploy:**
   ```bash
   git subtree push --prefix backend heroku main
   ```

6. **Note your backend URL:**
   ```
   https://diet-track-backend.herokuapp.com
   ```

---

## Part 3: Frontend Deployment (Vercel)

### 1. Update Frontend Configuration

1. **Create `.env.production` in frontend directory:**
   ```
   REACT_APP_API_URL=https://your-backend-url.com/api
   ```
   Replace with your actual backend URL from Part 2.

2. **Update package.json (remove proxy for production):**
   - The proxy is only for local development
   - In production, API calls will use REACT_APP_API_URL

### 2. Deploy to Vercel

1. **Install Vercel CLI:**
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel:**
   ```bash
   vercel login
   ```

3. **Deploy Frontend:**
   ```bash
   cd frontend
   vercel
   ```

4. **Configure Deployment:**
   - Project name: `diet-track`
   - Directory: `./` (current directory)
   - Build command: `npm run build`
   - Output directory: `build`

5. **Set Environment Variables:**
   ```bash
   vercel env add REACT_APP_API_URL
   ```
   Enter your backend URL: `https://your-backend-url.com/api`

6. **Deploy to Production:**
   ```bash
   vercel --prod
   ```

7. **Note your frontend URL:**
   ```
   https://diet-track.vercel.app
   ```

### Alternative: Deploy to Netlify

1. **Create `netlify.toml` in frontend directory:**
   ```toml
   [build]
     command = "npm run build"
     publish = "build"

   [[redirects]]
     from = "/*"
     to = "/index.html"
     status = 200
   ```

2. **Deploy via Netlify CLI:**
   ```bash
   npm install -g netlify-cli
   netlify login
   cd frontend
   netlify deploy --prod
   ```

3. **Or deploy via Netlify Dashboard:**
   - Go to [Netlify](https://www.netlify.com)
   - Click **Add new site** → **Import an existing project**
   - Connect GitHub repository
   - Configure:
     - Base directory: `frontend`
     - Build command: `npm run build`
     - Publish directory: `frontend/build`
   - Add environment variable:
     - Key: `REACT_APP_API_URL`
     - Value: `https://your-backend-url.com/api`

---

## Part 4: Update Backend CORS

After deploying frontend, update backend CORS settings:

1. **Edit `backend/server.js`:**
   ```javascript
   const cors = require('cors');
   
   const corsOptions = {
     origin: [
       'http://localhost:3000',
       'https://your-frontend-url.vercel.app'
     ],
     credentials: true
   };
   
   app.use(cors(corsOptions));
   ```

2. **Redeploy backend** with the updated CORS settings.

---

## Part 5: Post-Deployment Checklist

### 1. Test All Features

- [ ] User registration
- [ ] User login
- [ ] Profile update
- [ ] BMI calculation
- [ ] Meal tracking
- [ ] Food search
- [ ] Dashboard charts
- [ ] Recommendations
- [ ] Admin panel (if admin user)

### 2. Security Checklist

- [ ] Change default admin password
- [ ] Use strong JWT_SECRET
- [ ] Enable HTTPS (automatic on Vercel/Render)
- [ ] Restrict MongoDB network access
- [ ] Set secure CORS origins
- [ ] Enable rate limiting (optional)

### 3. Performance Optimization

- [ ] Enable MongoDB indexes (already configured in models)
- [ ] Monitor API response times
- [ ] Check frontend bundle size
- [ ] Enable caching headers

### 4. Monitoring

- [ ] Set up error tracking (e.g., Sentry)
- [ ] Monitor database usage
- [ ] Set up uptime monitoring
- [ ] Check application logs regularly

---

## Environment Variables Summary

### Backend (.env)
```
PORT=5000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/diet-track
JWT_SECRET=your_very_secure_random_string_here
NODE_ENV=production
```

### Frontend (.env.production)
```
REACT_APP_API_URL=https://your-backend-url.com/api
```

---

## Custom Domain Setup (Optional)

### For Vercel (Frontend)

1. Go to your project settings
2. Click **Domains**
3. Add your custom domain
4. Update DNS records as instructed

### For Render (Backend)

1. Go to your service settings
2. Click **Custom Domains**
3. Add your custom domain
4. Update DNS records as instructed

---

## Continuous Deployment

Both Vercel and Render support automatic deployments:

1. **Connect GitHub repository**
2. **Enable automatic deployments**
3. **Every push to main branch will trigger deployment**

To set up:
- Vercel: Automatically enabled when connecting GitHub
- Render: Enable "Auto-Deploy" in service settings

---

## Backup Strategy

### Database Backups

1. **MongoDB Atlas Automatic Backups:**
   - Available on paid plans
   - Configure in Atlas dashboard

2. **Manual Backups:**
   ```bash
   mongodump --uri="your_mongodb_atlas_connection_string"
   ```

3. **Restore from Backup:**
   ```bash
   mongorestore --uri="your_mongodb_atlas_connection_string" dump/
   ```

---

## Scaling Considerations

### When to Scale

- More than 1000 active users
- Database queries taking > 1 second
- High memory/CPU usage
- Frequent timeouts

### How to Scale

1. **Database:**
   - Upgrade MongoDB Atlas tier
   - Add read replicas
   - Enable sharding

2. **Backend:**
   - Upgrade Render/Heroku plan
   - Add more instances
   - Implement caching (Redis)

3. **Frontend:**
   - Vercel scales automatically
   - Optimize images and assets
   - Implement code splitting

---

## Troubleshooting Deployment

### Backend Issues

**Problem:** Application crashes on startup
- Check logs: `heroku logs --tail` or Render dashboard
- Verify environment variables
- Check MongoDB connection

**Problem:** API calls timeout
- Check MongoDB Atlas network access
- Verify connection string
- Check backend logs

### Frontend Issues

**Problem:** API calls fail
- Verify REACT_APP_API_URL is correct
- Check CORS settings on backend
- Inspect network tab in browser DevTools

**Problem:** Build fails
- Check for missing dependencies
- Verify Node version compatibility
- Review build logs

---

## Support and Maintenance

### Regular Maintenance Tasks

- Update dependencies monthly
- Review and rotate secrets quarterly
- Monitor error logs weekly
- Backup database weekly
- Test critical features after updates

### Getting Help

- Check application logs
- Review error messages
- Test locally first
- Check hosting provider status pages

---

## Cost Estimates (Free Tier)

- **MongoDB Atlas:** Free (512 MB storage)
- **Render:** Free (750 hours/month)
- **Vercel:** Free (100 GB bandwidth)

**Total:** $0/month for small-scale deployment

For production with more users, expect:
- MongoDB Atlas: $9-25/month
- Render/Heroku: $7-25/month
- Vercel: Free (generous limits)

**Total:** ~$16-50/month for production deployment
