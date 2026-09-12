/**
 * Authentication Routes.
 * Public and guest-only authentication routes.
 */
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { guest } = require('../middleware/guest');
const { authRateLimiter } = require('../middleware/rateLimiter');

// Guest routes (redirect to /dashboard if user is already logged in)
router.get('/login', guest, authController.showLogin);
router.post('/login', guest, authRateLimiter, authController.login);

router.get('/signup', guest, authController.showSignup);
router.post('/signup', guest, authRateLimiter, authController.signup);

router.get('/forgot-password', guest, authController.showForgotPassword);

// Logout route (accessible to authenticated users or guests)
router.get('/logout', authController.logout);
router.post('/logout', authController.logout);

module.exports = router;
