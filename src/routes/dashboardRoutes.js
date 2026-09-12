/**
 * Dashboard & Protected User Routes.
 * All endpoints here require server-side session authentication via requireAuth.
 */
const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const { requireAuth } = require('../middleware/auth');

const ekycController = require('../controllers/ekycController');

router.get('/dashboard', requireAuth, dashboardController.index);
router.get('/profile', requireAuth, dashboardController.profile);
router.post('/profile/doctor', requireAuth, dashboardController.updateDoctorProfile);
router.post('/profile/delete-account', requireAuth, dashboardController.deleteAccount);
router.get('/settings', requireAuth, dashboardController.settings);

// Doctor eKYC Application Routes
router.get('/doctors/ekyc', requireAuth, ekycController.showEkycForm);
router.post('/doctors/ekyc', requireAuth, ekycController.submitEkycForm);

module.exports = router;

