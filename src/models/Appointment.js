// Appointment Mongoose Model
const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Patient ID is required'],
    },
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Doctor',
      required: [true, 'Doctor ID is required'],
    },
    date: {
      type: String,
      required: [true, 'Appointment date is required (YYYY-MM-DD)'],
      index: true,
    },
    timeSlot: {
      type: String,
      required: [true, 'Time slot is required (e.g. 09:30)'],
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected', 'completed', 'cancelled'],
      default: 'pending',
      index: true,
    },
    patientName: {
      type: String,
      trim: true,
      default: '',
    },
    patientPhone: {
      type: String,
      trim: true,
      default: '',
    },
    symptoms: {
      type: String,
      trim: true,
      default: '',
    },
    reason: {
      type: String,
      default: 'General Consultation',
    },
    doctorNotes: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

// Index to quickly check double bookings for active appointments
appointmentSchema.index({ doctor: 1, date: 1, timeSlot: 1 });

module.exports = mongoose.model('Appointment', appointmentSchema, 'bookings');
