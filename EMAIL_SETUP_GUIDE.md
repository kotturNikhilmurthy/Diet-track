# Email Setup Instructions for DIET Track

## Gmail Configuration

To enable email sending functionality, you need to configure Gmail with an App Password:

### Step 1: Enable 2-Step Verification
1. Go to your Google Account: https://myaccount.google.com/
2. Click on "Security" in the left sidebar
3. Under "How you sign in to Google", click on "2-Step Verification"
4. Follow the prompts to enable 2-Step Verification

### Step 2: Generate App Password
1. After enabling 2-Step Verification, go back to Security settings
2. Click on "2-Step Verification"
3. Scroll down and click on "App passwords"
4. Select "Mail" as the app and "Other (Custom name)" as the device
5. Enter "DIET Track" as the custom name
6. Click "Generate"
7. Google will show you a 16-character password - **COPY THIS**

### Step 3: Update .env File
1. Open `backend/.env`
2. Update the email settings:
   ```
   EMAIL_USER=your-gmail@gmail.com
   EMAIL_PASS=xxxx xxxx xxxx xxxx  (the 16-character app password)
   EMAIL_FROM=DIET Track <your-gmail@gmail.com>
   ```
3. Save the file

### Step 4: Restart Backend Server
1. Stop the backend server (Ctrl+C in the terminal)
2. Start it again: `npm start`

## Testing
1. Go to the Recommendations page in your app
2. Click the "Email Diet Plan" button
3. Check your email inbox for the diet plan

## Troubleshooting
- **"Invalid login" error**: Make sure you're using the App Password, not your regular Gmail password
- **"Less secure app access"**: This is no longer needed if you use App Passwords
- **Email not received**: Check spam folder and verify EMAIL_USER is correct

## Alternative: Using Other Email Services

### Outlook/Hotmail
```env
EMAIL_USER=your-email@outlook.com
EMAIL_PASS=your-password
```
Update email.service.js line 6:
```javascript
service: 'outlook',
```

### Custom SMTP
Update email.service.js createTransporter function:
```javascript
return nodemailer.createTransporter({
  host: 'smtp.your-domain.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});
```
