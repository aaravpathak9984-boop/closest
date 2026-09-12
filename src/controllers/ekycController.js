/**
 * Doctor eKYC Controller.
 * Handles rendering the Doctor eKYC verification application form and processing submissions.
 */
const Doctor = require('../models/Doctor');
const asyncHandler = require('../utils/asyncHandler');
const { setFlash } = require('../utils/flash');

/**
 * GET /doctors/ekyc - Render Doctor eKYC Application Form
 */
const showEkycForm = asyncHandler(async (req, res) => {
  if (req.user.role !== 'doctor' && req.user.role !== 'admin') {
    setFlash(req, 'error', 'Only doctors can access the eKYC Verification Application portal.');
    return res.redirect('/dashboard');
  }

  let doctor = await Doctor.findOne({ user: req.user.id });
  if (!doctor) {
    doctor = await Doctor.create({
      user: req.user.id,
      name: req.user.name,
      specialization: 'General Medicine',
      ekycStatus: 'not_applied',
      verificationStatus: 'pending',
    });
  }

  res.render('clinic/doctor-ekyc', {
    title: 'Doctor eKYC Verification Portal',
    user: req.user,
    doctor,
  });
});

/**
 * POST /doctors/ekyc - Process Doctor eKYC Application Submission
 */
const submitEkycForm = asyncHandler(async (req, res) => {
  if (req.user.role !== 'doctor' && req.user.role !== 'admin') {
    setFlash(req, 'error', 'Unauthorized action.');
    return res.redirect('/dashboard');
  }

  const {
    licenseNumber,
    govtIdType,
    govtIdNumber,
    qualification,
    specialization,
    experienceYears,
    consultationFee,
    bio,
    requestedDate,
    requestedTime,
  } = req.body;

  if (!licenseNumber || !govtIdNumber || !qualification || !specialization || !requestedDate || !requestedTime) {
    setFlash(req, 'error', 'Please fill in all mandatory fields including Medical License, Govt ID, Qualification, and Preferred Verification Date & Time Slot.');
    return res.redirect('/doctors/ekyc');
  }

  let doctor = await Doctor.findOne({ user: req.user.id });
  if (!doctor) {
    doctor = new Doctor({ user: req.user.id, name: req.user.name });
  }

  doctor.licenseNumber = licenseNumber.trim();
  doctor.govtIdType = govtIdType || 'Medical Council Registration Certificate';
  doctor.govtIdNumber = govtIdNumber.trim();
  doctor.qualification = qualification.trim();
  doctor.specialization = specialization.trim();
  doctor.experienceYears = Number(experienceYears) || 1;
  doctor.consultationFee = Number(consultationFee) || 500;
  if (bio) doctor.bio = bio.trim();

  doctor.ekycStatus = 'applied';
  doctor.verificationStatus = 'pending';
  doctor.isVerified = false;

  doctor.ekycSlot = {
    requestedDate: requestedDate.trim(),
    requestedTime: requestedTime.trim(),
    assignedSlot: '',
    adminNotes: 'Application received. Pending Master Admin video call slot confirmation.',
  };

  await doctor.save();

  setFlash(req, 'success', `eKYC Application submitted! Master Admin will assign your video verification slot for ${requestedDate} at ${requestedTime}.`);
  res.redirect('/appointments/doctor-queue');
});

module.exports = {
  showEkycForm,
  submitEkycForm,
};
