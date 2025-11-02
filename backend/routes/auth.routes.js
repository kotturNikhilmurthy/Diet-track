const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const {
  register,
  login,
  getMe,
  updateProfile,
  deleteAccount,
  refreshToken,
} = require('../controllers/auth.controller');
const { protect } = require('../middleware/auth.middleware');
const passport = require('passport');
const { generateToken } = require('../controllers/auth.controller');

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post(
  '/register',
  [
    body('name', 'Name is required').trim().notEmpty(),
    body('email', 'Please include a valid email').isEmail().normalizeEmail(),
    body('password', 'Password must be at least 6 characters').isLength({ min: 6 }),
  ],
  register
);

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post(
  '/login',
  [
    body('email', 'Please include a valid email').isEmail().normalizeEmail(),
    body('password', 'Password is required').exists(),
  ],
  login
);

// @route   GET /api/auth/me
// @desc    Get current user profile
// @access  Private
router.get('/me', protect, getMe);

// @route   PUT /api/auth/me
// @desc    Update user profile
// @access  Private
router.put('/me', protect, updateProfile);

// @route   DELETE /api/auth/me
// @desc    Delete user account
// @access  Private
router.delete('/me', protect, deleteAccount);

// @route   POST /api/auth/refresh-token
// @desc    Refresh JWT token
// @access  Private
router.post('/refresh-token', protect, refreshToken);

// @route   GET /api/auth/google
// @desc    Start Google OAuth flow
// @access  Public
router.get(
  '/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

// @route   GET /api/auth/google/callback
// @desc    Google OAuth callback
// @access  Public
router.get(
  '/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: process.env.FRONTEND_URL || 'http://localhost:3000/login' }),
  (req, res) => {
    try {
      // req.user populated by passport strategy
      const token = generateToken(req.user._id);
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      // Redirect to frontend with token in query param
      res.redirect(`${frontendUrl}/auth/callback?token=${token}`);
    } catch (err) {
      console.error('OAuth callback error:', err);
      res.redirect(process.env.FRONTEND_URL || 'http://localhost:3000/login');
    }
  }
);

module.exports = router;
