# Troubleshooting - Blank Page Issue

## Problem: React App Shows Blank Page

If you see a blank page with just "Practice" text, follow these steps:

## Solution Steps

### Step 1: Stop All Running Processes

Press `Ctrl + C` in both terminal windows to stop the servers.

### Step 2: Clear Cache and Reinstall

**Backend:**
```bash
cd backend
rmdir /s /q node_modules
del package-lock.json
npm install
```

**Frontend:**
```bash
cd frontend
rmdir /s /q node_modules
del package-lock.json
npm install
```

### Step 3: Verify MongoDB is Running

```bash
# Check if MongoDB service is running
net start | findstr MongoDB
```

If not running:
```bash
net start MongoDB
```

### Step 4: Seed Database (Backend)

```bash
cd backend
npm run seed
```

Expected output:
```
MongoDB connected for seeding
Cleared existing food items
Inserted 30 food items
Created default admin user
Database seeded successfully!
```

### Step 5: Start Backend

```bash
cd backend
npm start
```

Expected output:
```
Server running on port 5000
MongoDB connected
```

**Keep this terminal open!**

### Step 6: Start Frontend (New Terminal)

```bash
cd frontend
npm start
```

Expected output:
```
Compiled successfully!
webpack compiled successfully
```

Browser should open automatically to http://localhost:3000

### Step 7: Check Browser Console

If page is still blank:
1. Open browser DevTools (F12)
2. Check Console tab for errors
3. Check Network tab to see if API calls are working

## Common Issues

### Issue 1: "Module not found" errors

**Solution:**
```bash
cd frontend
npm install react-router-dom axios chart.js react-chartjs-2 @headlessui/react @heroicons/react
```

### Issue 2: Tailwind CSS not working

**Solution:**
```bash
cd frontend
npm install -D tailwindcss postcss autoprefixer
```

### Issue 3: Backend not connecting

**Check:**
- MongoDB is running
- Port 5000 is not in use
- `.env` file exists in backend folder

### Issue 4: CORS errors

**Solution:** Already configured in `backend/server.js`

### Issue 5: Blank page persists

**Try:**
1. Clear browser cache (Ctrl + Shift + Delete)
2. Try incognito/private window
3. Check if http://localhost:5000/api/foods works (should show JSON)

## Quick Test

### Test Backend:
```bash
curl http://localhost:5000/api/foods/categories
```

Should return JSON array of categories.

### Test Frontend Build:
```bash
cd frontend
npm run build
```

Should create a `build` folder without errors.

## Still Not Working?

### Complete Fresh Start:

1. **Stop all processes** (Ctrl + C in all terminals)

2. **Delete node_modules:**
```bash
cd backend
rmdir /s /q node_modules
cd ../frontend
rmdir /s /q node_modules
```

3. **Reinstall everything:**
```bash
cd backend
npm install
npm run seed
npm start
```

4. **In new terminal:**
```bash
cd frontend
npm install
npm start
```

## Verify Installation

After starting, you should see:

**Backend Terminal:**
```
Server running on port 5000
MongoDB connected
```

**Frontend Terminal:**
```
Compiled successfully!
Local: http://localhost:3000
```

**Browser:**
- Landing page with "DIET Track" header
- Green gradient background
- "Get Started" and "Sign In" buttons

## Need More Help?

Check these files:
- `RUN_INSTRUCTIONS.md` - Detailed setup
- `START_HERE.md` - Quick start
- `SETUP.md` - Complete guide

## Debug Checklist

- [ ] Node.js installed (check: `node --version`)
- [ ] MongoDB running (check: `net start | findstr MongoDB`)
- [ ] Backend dependencies installed (`backend/node_modules` exists)
- [ ] Frontend dependencies installed (`frontend/node_modules` exists)
- [ ] Database seeded (check: `npm run seed` output)
- [ ] Backend running on port 5000
- [ ] Frontend running on port 3000
- [ ] No console errors in browser (F12)
- [ ] Can access http://localhost:5000/api/foods
- [ ] Browser cache cleared
