/**
 * Dashboard & Protected User Routes.
 * All endpoints here require server-side session authentication via requireAuth.
 */
const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const { requireAuth } = require('../middleware/auth');

router.get('/dashboard', requireAuth, dashboardController.index);
router.get('/profile', requireAuth, dashboardController.profile);
router.post('/profile/doctor', requireAuth, dashboardController.updateDoctorProfile);
router.post('/profile/delete-account', requireAuth, dashboardController.deleteAccount);
router.get('/settings', requireAuth, dashboardController.settings);

module.exports = router;
