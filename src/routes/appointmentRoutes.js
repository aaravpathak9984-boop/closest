// Clinic Appointment & Doctor Routes
const express = require('express');
const router = express.Router();
const appointmentController = require('../controllers/appointmentController');
const { requireAuth } = require('../middleware/auth');

// Public Doctor Directory & Detailed Profiles
router.get('/doctors', appointmentController.listDoctors);
router.get('/doctors/:id', appointmentController.showDoctorProfile);
router.post('/doctors/:id/reviews', requireAuth, appointmentController.submitReview);

// Slot Availability JSON API
router.get('/api/v1/slots', appointmentController.getSlotAvailabilityApi);

// Protected Booking & Patient Routes
router.get('/appointments/book/:doctorId', requireAuth, appointmentController.showBookForm);
router.post('/appointments/book', requireAuth, appointmentController.bookAppointment);
router.get('/appointments/my-appointments', requireAuth, appointmentController.getPatientAppointments);

// Protected Doctor Onboarding & Verification Application Routes
router.get('/appointments/doctor-onboarding', requireAuth, appointmentController.showDoctorOnboarding);
router.post('/appointments/doctor-onboarding', requireAuth, appointmentController.processDoctorOnboarding);

// Protected Doctor / Admin Queue Routes
router.get('/appointments/doctor-queue', requireAuth, appointmentController.getDoctorQueue);
router.post('/appointments/:id/status', requireAuth, appointmentController.updateStatus);

module.exports = router;
