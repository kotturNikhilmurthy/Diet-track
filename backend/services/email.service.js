const nodemailer = require('nodemailer');

// Create reusable transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

// Send diet plan email
const sendDietPlanEmail = async (userEmail, userName, recommendations, userProfile) => {
  try {
    const transporter = createTransporter();

    // Build email HTML content
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #16a34a 0%, #15803d 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9fafb; padding: 30px; }
          .section { background: white; padding: 20px; margin-bottom: 20px; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
          .section-title { color: #16a34a; font-size: 18px; font-weight: bold; margin-bottom: 15px; border-bottom: 2px solid #16a34a; padding-bottom: 8px; }
          .profile-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 20px; }
          .profile-item { background: #f3f4f6; padding: 12px; border-radius: 6px; }
          .profile-label { font-size: 12px; color: #6b7280; margin-bottom: 4px; }
          .profile-value { font-size: 16px; font-weight: bold; color: #1f2937; }
          ul { list-style: none; padding: 0; }
          li { padding: 10px 0; border-bottom: 1px solid #e5e7eb; }
          li:last-child { border-bottom: none; }
          li:before { content: "✓ "; color: #16a34a; font-weight: bold; margin-right: 8px; }
          .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
          .badge { display: inline-block; background: #dcfce7; color: #166534; padding: 4px 12px; border-radius: 12px; font-size: 12px; margin: 4px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="margin: 0;">🥗 Your Personalized Diet Plan</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">DIET Track - Health & Nutrition Companion</p>
          </div>
          
          <div class="content">
            <p style="font-size: 16px; margin-bottom: 20px;">Hi <strong>${userName}</strong>,</p>
            <p style="margin-bottom: 30px;">Here's your personalized diet plan based on your health profile and fitness goals:</p>
            
            <!-- User Profile Summary -->
            <div class="section">
              <div class="section-title">📊 Your Health Profile</div>
              <div class="profile-grid">
                <div class="profile-item">
                  <div class="profile-label">BMI</div>
                  <div class="profile-value">${userProfile.bmi || 'N/A'} ${userProfile.bmiCategory ? `(${userProfile.bmiCategory})` : ''}</div>
                </div>
                <div class="profile-item">
                  <div class="profile-label">Fitness Goal</div>
                  <div class="profile-value">${userProfile.fitnessGoal ? userProfile.fitnessGoal.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') : 'Not Set'}</div>
                </div>
                <div class="profile-item">
                  <div class="profile-label">Daily Calories</div>
                  <div class="profile-value">${userProfile.dailyCalories || 'N/A'} kcal</div>
                </div>
                <div class="profile-item">
                  <div class="profile-label">Activity Level</div>
                  <div class="profile-value">${userProfile.activityLevel ? userProfile.activityLevel.charAt(0).toUpperCase() + userProfile.activityLevel.slice(1) : 'N/A'}</div>
                </div>
              </div>
              ${userProfile.healthConditions && userProfile.healthConditions.length > 0 ? `
                <div style="margin-top: 15px;">
                  <div class="profile-label">Health Conditions:</div>
                  <div style="margin-top: 8px;">
                    ${userProfile.healthConditions.map(c => `<span class="badge">${c.replace(/_/g, ' ').toUpperCase()}</span>`).join('')}
                  </div>
                </div>
              ` : ''}
            </div>

            ${recommendations.general && recommendations.general.length > 0 ? `
            <!-- General Recommendations -->
            <div class="section">
              <div class="section-title">💡 General Recommendations</div>
              <ul>
                ${recommendations.general.map(item => `<li>${item}</li>`).join('')}
              </ul>
            </div>
            ` : ''}

            ${recommendations.dietary && recommendations.dietary.length > 0 ? `
            <!-- Dietary Recommendations -->
            <div class="section">
              <div class="section-title">🍽️ Dietary Guidelines</div>
              <ul>
                ${recommendations.dietary.map(item => `<li>${item}</li>`).join('')}
              </ul>
            </div>
            ` : ''}

            ${recommendations.exercise && recommendations.exercise.length > 0 ? `
            <!-- Exercise Recommendations -->
            <div class="section">
              <div class="section-title">💪 Exercise Recommendations</div>
              <ul>
                ${recommendations.exercise.map(item => `<li>${item}</li>`).join('')}
              </ul>
            </div>
            ` : ''}

            ${recommendations.lifestyle && recommendations.lifestyle.length > 0 ? `
            <!-- Lifestyle Recommendations -->
            <div class="section">
              <div class="section-title">🌟 Lifestyle Tips</div>
              <ul>
                ${recommendations.lifestyle.map(item => `<li>${item}</li>`).join('')}
              </ul>
            </div>
            ` : ''}

            ${userProfile.macros ? `
            <!-- Macronutrient Targets -->
            <div class="section">
              <div class="section-title">📈 Daily Macronutrient Targets</div>
              <div class="profile-grid">
                <div class="profile-item">
                  <div class="profile-label">Protein</div>
                  <div class="profile-value">${userProfile.macros.protein}g</div>
                </div>
                <div class="profile-item">
                  <div class="profile-label">Carbohydrates</div>
                  <div class="profile-value">${userProfile.macros.carbs}g</div>
                </div>
                <div class="profile-item">
                  <div class="profile-label">Fats</div>
                  <div class="profile-value">${userProfile.macros.fat}g</div>
                </div>
              </div>
            </div>
            ` : ''}

            <p style="margin-top: 30px; padding: 20px; background: #fef3c7; border-left: 4px solid #f59e0b; border-radius: 4px;">
              <strong>💡 Pro Tip:</strong> Remember, consistency is key! Track your meals daily and adjust your plan as needed based on your progress.
            </p>
          </div>
          
          <div class="footer">
            <p>This plan was generated by <strong>DIET Track</strong></p>
            <p style="font-size: 12px; margin-top: 10px;">For best results, consult with a healthcare professional before making significant dietary changes.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const mailOptions = {
      from: process.env.EMAIL_FROM || 'DIET Track <noreply@diettrack.com>',
      to: userEmail,
      subject: `Your Personalized Diet Plan - DIET Track`,
      html: htmlContent,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error: error.message };
  }
};

module.exports = {
  sendDietPlanEmail,
};
