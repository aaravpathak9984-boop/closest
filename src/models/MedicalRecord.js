// Medical Record & Prescription Mongoose Model
const mongoose = require('mongoose');

const medicalRecordSchema = new mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Doctor',
      required: true,
    },
    patientName: {
      type: String,
      required: true,
    },
    diagnosis: {
      type: String,
      required: true,
    },
    prescriptions: [
      {
        medicineName: { type: String, required: true },
        dosage: { type: String, default: '1 tablet twice daily after meals' },
        durationDays: { type: Number, default: 5 },
      },
    ],
    labTestsRecommended: [String],
    doctorNotes: {
      type: String,
      default: '',
    },
    visitDate: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['active', 'completed', 'archived'],
      default: 'active',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('MedicalRecord', medicalRecordSchema);
