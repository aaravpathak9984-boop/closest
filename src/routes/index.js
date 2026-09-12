/**
 * Main Application Router.
 * Mounts all sub-routers (Pages, Auth, Dashboard, Health, API).
 */
const express = require('express');
const router = express.Router();
const healthController = require('../controllers/healthController');
const authRoutes = require('./authRoutes');
const dashboardRoutes = require('./dashboardRoutes');
const apiRoutes = require('./apiRoutes');

const appointmentRoutes = require('./appointmentRoutes');

const adminRoutes = require('./adminRoutes');

// Public Pages
router.get('/', (req, res) => {
  res.render('pages/home', {
    title: 'Home',
  });
});

router.get('/about', (req, res) => {
  res.render('pages/about', {
    title: 'About Clinic System',
  });
});

// Liveness / Health check endpoint
router.get('/health', healthController.getHealth);

// Sub-routers
router.use('/', authRoutes);
router.use('/', dashboardRoutes);
router.use('/', appointmentRoutes);
router.use('/admin', adminRoutes);
router.use('/api', apiRoutes);

module.exports = router;
