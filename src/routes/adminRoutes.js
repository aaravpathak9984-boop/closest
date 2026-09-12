// Clinic Admin Router
const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { requireAdmin } = require('../middleware/auth');

// All routes here require Admin / Doctor role
router.use(requireAdmin);

router.get('/dashboard', adminController.getAdminDashboard);
router.post('/doctors/add', adminController.addDoctor);
router.post('/doctors/:id/approve', adminController.approveDoctor);
router.post('/doctors/:id/reject', adminController.rejectDoctor);
router.post('/doctors/:id/delete', adminController.deleteDoctor);
router.post('/users/:id/delete', adminController.deleteUserAccount);
router.post('/appointments/:id/delete', adminController.deleteAppointment);

module.exports = router;
