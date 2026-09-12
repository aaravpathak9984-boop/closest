// Clinic Appointment Controller
const doctorService = require('../services/doctorService');
const appointmentService = require('../services/appointmentService');
const Doctor = require('../models/Doctor');
const { setFlash } = require('../utils/flash');
const asyncHandler = require('../utils/asyncHandler');

// GET /doctors - Browse Doctor Directory
const listDoctors = asyncHandler(async (req, res) => {
  if (req.user && req.user.role === 'doctor') {
    setFlash(req, 'info', 'Doctors manage patient consultations from the Doctor Queue workspace.');
    return res.redirect('/appointments/doctor-queue');
  }

  const doctors = await doctorService.getDoctors(req.query);
  const specializations = await doctorService.getSpecializations();

  res.render('clinic/doctors', {
    title: 'Find & Book Doctors',
    doctors,
    specializations,
    selectedSpecialization: req.query.specialization || '',
    searchQuery: req.query.search || '',
  });
});

// GET /appointments/book/:doctorId - Show booking form for chosen doctor
const showBookForm = asyncHandler(async (req, res) => {
  if (req.user && req.user.role === 'doctor') {
    setFlash(req, 'info', 'Doctors manage patient consultations from the Doctor Queue workspace.');
    return res.redirect('/appointments/doctor-queue');
  }
  const doctor = await doctorService.getDoctorById(req.params.doctorId);
  if (!doctor) {
    setFlash(req, 'error', 'Doctor not found');
    return res.redirect('/doctors');
  }

  const selectedDate = req.query.date || new Date().toISOString().split('T')[0];
  const slots = await appointmentService.getSlotAvailability(doctor._id, selectedDate);

  res.render('clinic/book', {
    title: `Book Appointment - ${doctor.name}`,
    doctor,
    selectedDate,
    slots,
    conflict: null,
    suggestedSlot: null,
  });
});

// POST /appointments/book - Process appointment booking with double-booking prevention
const bookAppointment = asyncHandler(async (req, res) => {
  const { doctorId, date, timeSlot, reason, patientName, patientPhone, symptoms } = req.body;
  const patientId = req.user.id;

  const doctor = await doctorService.getDoctorById(doctorId);
  if (!doctor) {
    setFlash(req, 'error', 'Doctor not found');
    return res.redirect('/doctors');
  }

  try {
    await appointmentService.bookAppointment({
      patientId,
      doctorId,
      date,
      timeSlot,
      patientName: patientName || (req.user ? req.user.name : ''),
      patientPhone: patientPhone || '',
      symptoms: symptoms || reason || 'General Consultation',
      reason: symptoms || reason || 'General Consultation',
    });

    setFlash(req, 'success', `Appointment successfully booked with ${doctor.name} on ${date} at ${timeSlot}!`);
    return res.redirect('/appointments/my-appointments');
  } catch (error) {
    if (error.isDoubleBooking) {
      // Double Booking Collision - Render conflict warning and Stretch Goal auto-suggested slot
      const slots = await appointmentService.getSlotAvailability(doctorId, date);
      return res.status(409).render('clinic/book', {
        title: `Book Appointment - ${doctor.name}`,
        doctor,
        selectedDate: date,
        slots,
        conflict: {
          message: `Slot ${timeSlot} on ${date} is already booked by another patient!`,
          attemptedSlot: timeSlot,
        },
        suggestedSlot: error.suggestedSlot, // Stretch goal recommendation
      });
    }
    throw error;
  }
});

// GET /appointments/my-appointments - Patient appointment history
const getPatientAppointments = asyncHandler(async (req, res) => {
  const Appointment = require('../models/Appointment');
  const appointments = await appointmentService.getPatientAppointments(req.user.id);

  // Compute live queue position for patient's active appointments
  const formattedAppointments = await Promise.all(
    appointments.map(async (app) => {
      const appObj = app.toObject ? app.toObject() : app;
      if (app.status === 'pending' || app.status === 'accepted') {
        const doctorApps = await Appointment.find({
          doctor: app.doctor ? app.doctor._id : app.doctor,
          date: app.date,
          status: { $in: ['pending', 'accepted'] },
        }).sort({ timeSlot: 1 });

        const myIndex = doctorApps.findIndex((a) => a._id.toString() === app._id.toString());
        if (myIndex !== -1) {
          const tokenNum = myIndex + 1;
          const waitMins = myIndex * 15;
          appObj.queueToken = `Token #${tokenNum}`;
          appObj.tokenLabel = tokenNum === 1 
            ? '🎟️ Token #1 - You are Next in Line!' 
            : `🎟️ Token #${tokenNum} - Waiting (${myIndex} patient${myIndex === 1 ? '' : 's'} ahead, ~${waitMins}m wait)`;
        }
      } else if (app.status === 'completed') {
        appObj.queueToken = 'Finished';
        appObj.tokenLabel = '✅ Completed Consultation';
      } else {
        appObj.queueToken = 'N/A';
        appObj.tokenLabel = '❌ Cancelled';
      }
      return appObj;
    })
  );

  res.render('clinic/patient-history', {
    title: 'My Appointment History',
    appointments: formattedAppointments,
  });
});

// GET /appointments/doctor-onboarding - Render doctor profile setup & verification application form
const showDoctorOnboarding = asyncHandler(async (req, res) => {
  let doctor = await Doctor.findOne({ user: req.user.id });

  res.render('clinic/doctor-onboarding', {
    title: 'Doctor Clinical Setup & Verification Application',
    doctor,
    currentUser: req.user,
  });
});

// POST /appointments/doctor-onboarding - Save/update doctor application details for admin verification
const processDoctorOnboarding = asyncHandler(async (req, res) => {
  const { name, specialization, qualification, consultationFee, experienceYears, startTime, endTime, bio } = req.body;

  let doctor = await Doctor.findOne({ user: req.user.id });

  const doctorData = {
    user: req.user.id,
    name: (name || req.user.name).trim(),
    specialization: (specialization || 'General Medicine').trim(),
    qualification: (qualification || 'MBBS, MD').trim(),
    consultationFee: Number(consultationFee) || 500,
    experienceYears: Number(experienceYears) || 5,
    workingHours: {
      start: startTime || '09:00',
      end: endTime || '17:00',
      slotDurationMinutes: 30,
    },
    bio: (bio || `Dr. ${name || req.user.name} is a specialist in ${specialization}.`).trim(),
    isVerified: false,
    verificationStatus: 'pending', // Requires Master Admin review
  };

  if (doctor) {
    doctor = await Doctor.findByIdAndUpdate(doctor._id, doctorData, { new: true });
  } else {
    doctor = await Doctor.create(doctorData);
  }

  setFlash(req, 'info', `⏳ Clinical verification application submitted! Pending review by Master Admin (aaravpathak9984@gmail.com).`);
  return res.redirect('/appointments/doctor-queue');
});

// GET /appointments/doctor-queue - Doctor queue view
const getDoctorQueue = asyncHandler(async (req, res) => {
  let doctor = await Doctor.findOne({ user: req.user.id });

  if (!doctor && req.user.role === 'doctor') {
    setFlash(req, 'info', 'Please complete your doctor clinical profile to submit for admin verification.');
    return res.redirect('/appointments/doctor-onboarding');
  }

  if (!doctor) {
    doctor = await Doctor.findOne();
  }

  if (!doctor) {
    setFlash(req, 'info', 'No doctor profiles registered in clinic system.');
    return res.redirect('/dashboard');
  }

  const statusFilter = req.query.status || '';
  const dateFilter = req.query.date || '';
  const sortBy = req.query.sortBy || 'time_asc';
  const rawAppointments = await appointmentService.getDoctorAppointments(doctor._id, statusFilter, sortBy, dateFilter);

  // Compute patient volume & waiting list metrics
  const Appointment = require('../models/Appointment');
  const allDoctorApps = await Appointment.find({ doctor: doctor._id }).populate('patient', 'name email');

  const patientIdentifiers = new Set(allDoctorApps.map((a) => (a.patient ? a.patient.toString() : a.patientName)));
  const selectedDateApps = dateFilter ? allDoctorApps.filter((a) => a.date === dateFilter) : allDoctorApps;

  // Compute active waiting line (pending or accepted)
  const activeQueue = selectedDateApps
    .filter((a) => a.status === 'pending' || a.status === 'accepted')
    .sort((a, b) => a.timeSlot.localeCompare(b.timeSlot));

  const nextPatient = activeQueue.length > 0 ? activeQueue[0] : null;

  // Build active token map for queue positions
  const activeTokenMap = new Map();
  activeQueue.forEach((app, idx) => {
    activeTokenMap.set(app._id.toString(), {
      tokenNum: idx + 1,
      waitMins: idx * 15,
    });
  });

  const appointments = rawAppointments.map((app) => {
    const appObj = app.toObject ? app.toObject() : app;
    const tokenInfo = activeTokenMap.get(app._id.toString());

    if (tokenInfo) {
      appObj.queueToken = `Token #${tokenInfo.tokenNum}`;
      appObj.tokenLabel = tokenInfo.tokenNum === 1
        ? '🎟️ Token #1 - 🚨 Next Patient'
        : `🎟️ Token #${tokenInfo.tokenNum} - Waiting (~${tokenInfo.waitMins}m wait)`;
    } else if (app.status === 'completed') {
      appObj.queueToken = 'Finished';
      appObj.tokenLabel = '✅ Completed Visit';
    } else {
      appObj.queueToken = 'N/A';
      appObj.tokenLabel = '❌ Cancelled';
    }
    return appObj;
  });

  const metrics = {
    totalPatients: patientIdentifiers.size,
    totalConsultations: allDoctorApps.length,
    selectedDatePatientCount: selectedDateApps.length,
    waitingCount: activeQueue.length,
    pendingCount: selectedDateApps.filter((a) => a.status === 'pending').length,
    acceptedCount: selectedDateApps.filter((a) => a.status === 'accepted').length,
    completedCount: selectedDateApps.filter((a) => a.status === 'completed').length,
  };

  res.render('clinic/doctor-dashboard', {
    title: `Doctor Queue - ${doctor.name}`,
    doctor,
    appointments,
    metrics,
    nextPatient,
    selectedStatus: statusFilter,
    selectedDate: dateFilter,
    sortBy,
  });
});

// POST /appointments/:id/status - Update status (accept, reject, completed, cancelled)
const updateStatus = asyncHandler(async (req, res) => {
  const { status, doctorNotes } = req.body;
  const appointmentId = req.params.id;

  await appointmentService.updateStatus(appointmentId, status, doctorNotes);

  setFlash(req, 'success', `Appointment status updated to '${status.toUpperCase()}'.`);

  if (req.user.role === 'patient') {
    return res.redirect('/appointments/my-appointments');
  }
  return res.redirect('/appointments/doctor-queue');
});

// GET /doctors/:id - Show Doctor Detailed Profile & Patient Reviews Page
const showDoctorProfile = asyncHandler(async (req, res) => {
  const doctor = await doctorService.getDoctorById(req.params.id);
  if (!doctor) {
    setFlash(req, 'error', 'Doctor not found');
    return res.redirect('/doctors');
  }

  const reviews = await doctorService.getDoctorReviews(doctor._id);

  res.render('clinic/doctor-profile', {
    title: `${doctor.name} - Profile & Patient Reviews`,
    doctor,
    reviews,
    currentUser: req.user,
  });
});

// POST /doctors/:id/reviews - Submit a Patient Review & Rating for Doctor
const submitReview = asyncHandler(async (req, res) => {
  const { rating, comment } = req.body;
  const doctorId = req.params.id;

  if (!rating || !comment || comment.trim().length === 0) {
    setFlash(req, 'error', 'Please provide a valid rating (1-5 stars) and review comment.');
    return res.redirect(`/doctors/${doctorId}#reviewsSection`);
  }

  await doctorService.addDoctorReview({
    doctorId,
    patientUser: req.user,
    rating,
    comment,
  });

  setFlash(req, 'success', 'Thank you! Your patient review has been published.');
  return res.redirect(`/doctors/${doctorId}#reviewsSection`);
});

// GET /api/v1/slots - JSON endpoint for slot availability
const getSlotAvailabilityApi = asyncHandler(async (req, res) => {
  const { doctorId, date } = req.query;
  if (!doctorId || !date) {
    return res.status(400).json({ success: false, error: 'doctorId and date query params required' });
  }

  const slots = await appointmentService.getSlotAvailability(doctorId, date);
  res.json({ success: true, doctorId, date, slots });
});

module.exports = {
  listDoctors,
  showDoctorProfile,
  submitReview,
  showBookForm,
  bookAppointment,
  getPatientAppointments,
  showDoctorOnboarding,
  processDoctorOnboarding,
  getDoctorQueue,
  updateStatus,
  getSlotAvailabilityApi,
};
