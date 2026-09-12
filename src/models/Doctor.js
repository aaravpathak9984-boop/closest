// Doctor Profile Mongoose Model
const mongoose = require('mongoose');

const doctorSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    name: {
      type: String,
      required: [true, 'Doctor name is required'],
      trim: true,
    },
    specialization: {
      type: String,
      required: [true, 'Specialization is required'],
      trim: true,
      index: true,
    },
    qualification: {
      type: String,
      default: '',
    },
    licenseNumber: {
      type: String,
      default: '',
      trim: true,
    },
    govtIdType: {
      type: String,
      default: 'Medical Council Registration Certificate',
      trim: true,
    },
    govtIdNumber: {
      type: String,
      default: '',
      trim: true,
    },
    experienceYears: {
      type: Number,
      default: 0,
    },
    consultationFee: {
      type: Number,
      default: 0,
    },
    bio: {
      type: String,
      default: '',
    },
    workingHours: {
      start: { type: String, default: '09:00' },
      end: { type: String, default: '17:00' },
      slotDurationMinutes: { type: Number, default: 30 },
    },
    ekycStatus: {
      type: String,
      enum: ['not_applied', 'applied', 'slot_assigned', 'verified', 'rejected'],
      default: 'not_applied',
    },
    ekycSlot: {
      requestedDate: { type: String, default: '' },
      requestedTime: { type: String, default: '' },
      assignedSlot: { type: String, default: '' },
      adminNotes: { type: String, default: '' },
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    verificationStatus: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    averageRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5.0,
    },
    reviewCount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Doctor', doctorSchema, 'doctors');

