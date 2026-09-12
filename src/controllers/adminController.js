// Clinic Admin Management Controller
const Doctor = require('../models/Doctor');
const User = require('../models/User');
const Appointment = require('../models/Appointment');
const Branch = require('../models/Branch');
const Department = require('../models/Department');
const MedicalRecord = require('../models/MedicalRecord');
const doctorService = require('../services/doctorService');
const seedService = require('../services/seedService');
const authService = require('../services/authService');
const { setFlash } = require('../utils/flash');
const asyncHandler = require('../utils/asyncHandler');

// GET /admin/dashboard - Clinic Admin Master Dashboard
const getAdminDashboard = asyncHandler(async (req, res) => {
  await doctorService.seedInitialDoctors();
  await seedService.seedAllDomainEntities();

  const doctors = await Doctor.find().populate('user', 'name email').sort({ name: 1 });
  const totalPatients = await User.countDocuments({ role: 'patient' });
  const branches = await Branch.find().sort({ branchName: 1 });
  const departments = await Department.find().sort({ name: 1 });
  const medicalRecords = await MedicalRecord.find().populate('doctor').sort({ createdAt: -1 });

  const filter = {};
  if (req.query.doctor) {
    filter.doctor = req.query.doctor;
  }
  if (req.query.status) {
    filter.status = req.query.status;
  }

  const appointments = await Appointment.find(filter)
    .populate('doctor')
    .populate('patient', 'name email')
    .sort({ date: -1, timeSlot: 1 });

  const allAppointments = await Appointment.find().populate('doctor');

  // Compute Clinic Financial & Operational Revenue Analytics
  const completedApps = allAppointments.filter((a) => a.status === 'completed');
  const totalRevenue = completedApps.reduce((sum, app) => sum + (app.doctor?.consultationFee || 500), 0);

  const metrics = {
    totalRevenue,
    totalPatients,
    totalDoctors: doctors.length,
    totalBranches: branches.length,
    totalDepartments: departments.length,
    totalMedicalRecords: medicalRecords.length,
    totalAppointments: allAppointments.length,
    pendingCount: allAppointments.filter((a) => a.status === 'pending').length,
    acceptedCount: allAppointments.filter((a) => a.status === 'accepted').length,
    completedCount: completedApps.length,
    rejectedCount: allAppointments.filter((a) => a.status === 'rejected').length,
  };

  const pendingDoctors = await Doctor.find({
    verificationStatus: 'pending',
  }).populate('user', 'name email').sort({ createdAt: -1 });

  const rejectedDoctors = await Doctor.find({
    verificationStatus: 'rejected',
  }).populate('user', 'name email').sort({ createdAt: -1 });

  const allUsers = await User.find().sort({ createdAt: -1 });

  res.render('admin/dashboard', {
    title: 'Clinic Admin Portal',
    user: req.user,
    doctors,
    pendingDoctors,
    rejectedDoctors,
    allUsers,
    branches,
    departments,
    medicalRecords,
    appointments,
    metrics,
    selectedDoctor: req.query.doctor || '',
    selectedStatus: req.query.status || '',
  });
});

// POST /admin/doctors/add - Add new doctor to clinic directory (Admin created doctors are auto-approved)
const addDoctor = asyncHandler(async (req, res) => {
  const { name, email, password, specialization, qualification, consultationFee, experienceYears, startTime, endTime, bio } = req.body;

  if (!name || !email || !password || !specialization) {
    setFlash(req, 'error', 'Name, Email, Password, and Specialization are required.');
    return res.redirect('/admin/dashboard');
  }

  // Create user account for doctor
  const user = await authService.registerUser({
    name,
    email,
    password,
    role: 'doctor',
  });

  // Create Doctor profile
  await Doctor.create({
    user: user._id,
    name: name.trim(),
    specialization: specialization.trim(),
    qualification: qualification ? qualification.trim() : 'MBBS, MD',
    consultationFee: Number(consultationFee) || 500,
    experienceYears: Number(experienceYears) || 5,
    workingHours: {
      start: startTime || '09:00',
      end: endTime || '17:00',
      slotDurationMinutes: 30,
    },
    bio: bio ? bio.trim() : `Dr. ${name} is a specialist in ${specialization}.`,
    isVerified: true,
    verificationStatus: 'approved',
  });

  setFlash(req, 'success', `New doctor ${name} (${specialization}) added & verified in clinic directory!`);
  res.redirect('/admin/dashboard');
});

// POST /admin/doctors/:id/approve - Approve pending doctor application
const approveDoctor = asyncHandler(async (req, res) => {
  const doctorId = req.params.id;
  const doctor = await Doctor.findByIdAndUpdate(doctorId, { isVerified: true, verificationStatus: 'approved' }, { new: true });
  if (doctor) {
    setFlash(req, 'success', `Dr. ${doctor.name} verified & approved! Added to active clinic directory.`);
  }
  const referer = req.header('Referer');
  if (referer && !referer.includes('/login')) {
    return res.redirect(referer);
  }
  res.redirect('/admin/dashboard');
});

// POST /admin/doctors/:id/reject - Reject pending doctor application
const rejectDoctor = asyncHandler(async (req, res) => {
  const doctorId = req.params.id;
  const doctor = await Doctor.findByIdAndUpdate(doctorId, { isVerified: false, verificationStatus: 'rejected' }, { new: true });
  if (doctor) {
    setFlash(req, 'info', `Doctor application for Dr. ${doctor.name} marked as rejected.`);
  }
  const referer = req.header('Referer');
  if (referer && !referer.includes('/login')) {
    return res.redirect(referer);
  }
  res.redirect('/admin/dashboard');
});

// POST /admin/doctors/:id/delete - Remove doctor from clinic
const deleteDoctor = asyncHandler(async (req, res) => {
  const doctorId = req.params.id;
  const doctor = await Doctor.findById(doctorId);

  if (doctor) {
    await User.findByIdAndDelete(doctor.user);
    await Doctor.findByIdAndDelete(doctorId);
    setFlash(req, 'success', `Doctor ${doctor.name} removed from clinic directory.`);
  }

  res.redirect('/admin/dashboard');
});

// POST /admin/appointments/:id/delete - Delete appointment record from clinic database
const deleteAppointment = asyncHandler(async (req, res) => {
  const appointmentId = req.params.id;
  await Appointment.findByIdAndDelete(appointmentId);
  setFlash(req, 'success', 'Appointment record permanently deleted.');
  res.redirect('/admin/dashboard');
});

// POST /admin/users/:id/delete - Delete user account completely from database
const deleteUserAccount = asyncHandler(async (req, res) => {
  const userId = req.params.id;
  const user = await User.findById(userId);

  if (user) {
    const userEmail = user.email ? user.email.toLowerCase() : '';
    const userName = user.name;

    const Patient = require('../models/Patient');
    const Admin = require('../models/Admin');

    await User.findByIdAndDelete(userId);
    await Patient.deleteMany({ $or: [{ user: userId }, { email: userEmail }] });
    await Doctor.deleteMany({ $or: [{ user: userId }, { name: userName }] });
    await Admin.deleteMany({ email: userEmail });
    await Appointment.deleteMany({ $or: [{ patient: userId }, { patientName: userName }] });

    setFlash(req, 'success', `User account ${user.email} (${user.name}) and all associated records permanently deleted from MongoDB.`);
  } else {
    setFlash(req, 'error', 'User account not found.');
  }

  res.redirect('/admin/dashboard');
});

module.exports = {
  getAdminDashboard,
  addDoctor,
  approveDoctor,
  rejectDoctor,
  deleteDoctor,
  deleteAppointment,
  deleteUserAccount,
};
