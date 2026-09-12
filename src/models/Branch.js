// Clinic Branch / Location Mongoose Model
const mongoose = require('mongoose');

const branchSchema = new mongoose.Schema(
  {
    branchName: {
      type: String,
      required: true,
      unique: true,
    },
    city: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    emergencyPhone: {
      type: String,
      default: '+91 1800-123-4567',
    },
    operatingHours: {
      type: String,
      default: '24/7 Emergency & OPD 08:00 - 20:00',
    },
    activeDoctorsCount: {
      type: Number,
      default: 5,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Branch', branchSchema);
