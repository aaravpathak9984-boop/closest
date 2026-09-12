/**
 * Dashboard Controller (Domain-Neutral Foundation).
 * Provides protected overview metrics, activity logs, filterable data tables,
 * and proof of search, filter, sort, pagination data utilities.
 */
const { buildQuery } = require('../utils/queryBuilder');
const { getPaginationParams, getPaginationResult } = require('../utils/pagination');
const asyncHandler = require('../utils/asyncHandler');
const { setFlash } = require('../utils/flash');

// Domain-neutral mock records dataset for testing search/filter/sort/pagination
const MOCK_RECORDS = [
  { id: 'REC-101', title: 'System Security Audit Log', category: 'Security', status: 'Completed', date: '2026-09-01', priority: 'High' },
  { id: 'REC-102', title: 'Database Optimization Task', category: 'Infrastructure', status: 'In Progress', date: '2026-09-02', priority: 'Medium' },
  { id: 'REC-103', title: 'User Access Control Review', category: 'Compliance', status: 'Pending', date: '2026-09-03', priority: 'Low' },
  { id: 'REC-104', title: 'API Rate Limiting Check', category: 'Security', status: 'Completed', date: '2026-09-04', priority: 'Medium' },
  { id: 'REC-105', title: 'Backup Verification Schedule', category: 'Infrastructure', status: 'In Progress', date: '2026-09-05', priority: 'High' },
  { id: 'REC-106', title: 'Telemetry Metrics Collection', category: 'Analytics', status: 'Completed', date: '2026-09-06', priority: 'Low' },
  { id: 'REC-107', title: 'Session Memory Cleanup', category: 'Infrastructure', status: 'Pending', date: '2026-09-07', priority: 'Medium' },
];

const Doctor = require('../models/Doctor');
const Appointment = require('../models/Appointment');
const doctorService = require('../services/doctorService');

/**
 * GET /dashboard - Role-aware Clinic Dashboard
 */
const index = asyncHandler(async (req, res) => {
  await doctorService.seedInitialDoctors();

  const totalDoctors = await Doctor.countDocuments();
  let metrics = {};
  let recentAppointments = [];

  if (req.user.role === 'doctor') {
    const doctor = await Doctor.findOne({ user: req.user.id }) || await Doctor.findOne();

    if (doctor) {
      const doctorApps = await Appointment.find({ doctor: doctor._id }).populate('patient', 'name email').sort({ date: -1 });
      metrics = {
        totalAppointments: doctorApps.length,
        pendingCount: doctorApps.filter((a) => a.status === 'pending').length,
        acceptedCount: doctorApps.filter((a) => a.status === 'accepted').length,
        completedCount: doctorApps.filter((a) => a.status === 'completed').length,
        systemStatus: 'Online',
      };
      recentAppointments = doctorApps.slice(0, 10);
    }
  } else {
    // Patient / Admin dashboard
    const patientApps = await Appointment.find({ patient: req.user.id }).populate('doctor').sort({ date: -1 });
    metrics = {
      totalDoctors,
      activeBookings: patientApps.filter((a) => a.status === 'pending' || a.status === 'accepted').length,
      completedVisits: patientApps.filter((a) => a.status === 'completed').length,
      systemStatus: 'Operational',
    };
    recentAppointments = patientApps.slice(0, 10);
  }

  res.render('dashboard/index', {
    title: 'Clinic Dashboard',
    user: req.user,
    metrics,
    recentAppointments,
  });
});

/**
 * GET /profile - Protected user & doctor profile portal
 */
const profile = asyncHandler(async (req, res) => {
  let doctor = null;
  if (req.user.role === 'doctor' || req.user.role === 'admin') {
    doctor = await Doctor.findOne({ user: req.user.id });
    if (!doctor) {
      // Auto create Doctor profile if missing
      doctor = await Doctor.create({
        user: req.user.id,
        name: req.user.name,
        specialization: 'General Medicine',
        qualification: 'MBBS, MD',
        experienceYears: 5,
        consultationFee: 500,
        bio: `Dr. ${req.user.name} is a medical consultant.`,
        workingHours: { start: '09:00', end: '17:00', slotDurationMinutes: 30 },
      });
    }
  }

  res.render('pages/profile', {
    title: 'User Profile & Settings',
    user: req.user,
    doctor,
  });
});

/**
 * POST /profile/doctor - Update Doctor practice settings
 */
const updateDoctorProfile = asyncHandler(async (req, res) => {
  const { name, specialization, qualification, consultationFee, experienceYears, startTime, endTime, bio } = req.body;

  let doctor = await Doctor.findOne({ user: req.user.id });
  if (!doctor) {
    doctor = new Doctor({ user: req.user.id });
  }

  doctor.name = name ? name.trim() : req.user.name;
  doctor.specialization = specialization ? specialization.trim() : 'General Medicine';
  doctor.qualification = qualification ? qualification.trim() : 'MBBS, MD';
  doctor.consultationFee = Number(consultationFee) || 500;
  doctor.experienceYears = Number(experienceYears) || 5;
  doctor.workingHours = {
    start: startTime || '09:00',
    end: endTime || '17:00',
    slotDurationMinutes: 30,
  };
  doctor.bio = bio ? bio.trim() : '';

  if (doctor.verificationStatus === 'rejected') {
    doctor.verificationStatus = 'pending';
    doctor.isVerified = false;
    await doctor.save();
    setFlash(req, 'info', 'Doctor application resubmitted for Master Admin verification!');
  } else {
    await doctor.save();
    setFlash(req, 'success', 'Doctor practice profile and consultation fees updated successfully!');
  }

  res.redirect('/profile');
});

/**
 * GET /settings - Protected settings page
 */
const settings = asyncHandler(async (req, res) => {
  res.redirect('/profile');
});

/**
 * POST /profile/delete-account - Completely delete logged-in user account from MongoDB
 */
const deleteAccount = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const userEmail = req.user.email ? req.user.email.toLowerCase() : '';
  const userName = req.user.name;

  const User = require('../models/User');
  const Patient = require('../models/Patient');
  const Doctor = require('../models/Doctor');
  const Admin = require('../models/Admin');
  const Appointment = require('../models/Appointment');
  const Review = require('../models/Review');

  // 1. Delete main User account record
  await User.findByIdAndDelete(userId);

  // 2. Delete linked Patient record
  if (userEmail) {
    await Patient.deleteMany({ $or: [{ user: userId }, { email: userEmail }] });
  } else {
    await Patient.deleteMany({ user: userId });
  }

  // 3. Delete linked Doctor record
  await Doctor.deleteMany({ $or: [{ user: userId }, { name: userName }] });

  // 4. Delete linked Admin record if exists
  if (userEmail) {
    await Admin.deleteMany({ email: userEmail });
  }

  // 5. Delete appointments associated with user
  await Appointment.deleteMany({ $or: [{ patient: userId }, { patientName: userName }] });

  // 6. Delete patient reviews
  await Review.deleteMany({ patient: userId });

  // 7. Destroy active auth session and clear cookie
  req.session.destroy(() => {
    res.clearCookie('connect.sid');
    res.redirect('/signup?deleted=success');
  });
});

module.exports = {
  index,
  profile,
  updateDoctorProfile,
  settings,
  deleteAccount,
};

