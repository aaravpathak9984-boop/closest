// Appointment Business Logic & Double Booking Prevention Service
const Appointment = require('../models/Appointment');
const Doctor = require('../models/Doctor');

class AppointmentService {
  // Helper to generate 30-minute time slots for working hours (default 09:00 to 17:00)
  generateTimeSlots(startStr = '09:00', endStr = '17:00', intervalMinutes = 30) {
    const slots = [];
    const [startHour, startMin] = startStr.split(':').map(Number);
    const [endHour, endMin] = endStr.split(':').map(Number);

    let current = new Date();
    current.setHours(startHour, startMin, 0, 0);

    const endTime = new Date();
    endTime.setHours(endHour, endMin, 0, 0);

    while (current < endTime) {
      const hours = String(current.getHours()).padStart(2, '0');
      const mins = String(current.getMinutes()).padStart(2, '0');
      slots.push(`${hours}:${mins}`);
      current.setMinutes(current.getMinutes() + intervalMinutes);
    }

    return slots;
  }

  // Get all time slots for a doctor on a specific date marked as available/booked
  async getSlotAvailability(doctorId, dateStr) {
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) throw new Error('Doctor not found');

    const workingStart = doctor.workingHours?.start || '09:00';
    const workingEnd = doctor.workingHours?.end || '17:00';
    const allSlots = this.generateTimeSlots(workingStart, workingEnd);

    // Find all active non-cancelled/non-rejected appointments for doctor on date
    const bookedAppointments = await Appointment.find({
      doctor: doctorId,
      date: dateStr,
      status: { $in: ['pending', 'accepted', 'completed'] },
    });

    const bookedSlotsSet = new Set(bookedAppointments.map((app) => app.timeSlot));

    return allSlots.map((slot) => ({
      timeSlot: slot,
      isAvailable: !bookedSlotsSet.has(slot),
    }));
  }

  // Check if a specific doctor slot is already booked
  async isSlotBooked(doctorId, dateStr, timeSlot) {
    const existing = await Appointment.findOne({
      doctor: doctorId,
      date: dateStr,
      timeSlot: timeSlot,
      status: { $in: ['pending', 'accepted', 'completed'] },
    });
    return !!existing;
  }

  // STRETCH GOAL: Auto-suggest next available slot if chosen one is taken
  async findNextAvailableSlot(doctorId, startDateStr, attemptedTimeSlot) {
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) return null;

    const workingStart = doctor.workingHours?.start || '09:00';
    const workingEnd = doctor.workingHours?.end || '17:00';
    const allSlots = this.generateTimeSlots(workingStart, workingEnd);

    // Search up to 7 consecutive days for the next open slot
    let currentDateObj = new Date(startDateStr);

    for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
      const dateStr = currentDateObj.toISOString().split('T')[0];
      const slotsAvailability = await this.getSlotAvailability(doctorId, dateStr);

      for (const slotObj of slotsAvailability) {
        if (!slotObj.isAvailable) continue;

        // On the first day, only consider slots after the attempted time slot
        if (dayOffset === 0) {
          if (slotObj.timeSlot > attemptedTimeSlot) {
            return { date: dateStr, timeSlot: slotObj.timeSlot };
          }
        } else {
          return { date: dateStr, timeSlot: slotObj.timeSlot };
        }
      }

      // Increment by 1 day
      currentDateObj.setDate(currentDateObj.getDate() + 1);
    }

    return null;
  }

  // Book an appointment with double-booking prevention & auto-suggest on collision
  async bookAppointment({ patientId, doctorId, date, timeSlot, reason, patientName = '', patientPhone = '', symptoms = '' }) {
    // 1. Double Booking Check
    const booked = await this.isSlotBooked(doctorId, date, timeSlot);

    if (booked) {
      // Run Stretch Goal Algorithm to find next available slot
      const nextAvailable = await this.findNextAvailableSlot(doctorId, date, timeSlot);

      const error = new Error(`Slot ${timeSlot} on ${date} is already booked.`);
      error.statusCode = 409;
      error.isDoubleBooking = true;
      error.suggestedSlot = nextAvailable;
      throw error;
    }

    // 2. Create Appointment with full patient details & symptoms
    const appointment = await Appointment.create({
      patient: patientId,
      doctor: doctorId,
      date,
      timeSlot,
      patientName: patientName.trim(),
      patientPhone: patientPhone.trim(),
      symptoms: (symptoms || reason || 'General Consultation').trim(),
      reason: (symptoms || reason || 'General Consultation').trim(),
      status: 'pending',
    });

    return appointment;
  }

  // Get appointments for a specific patient
  async getPatientAppointments(patientId) {
    return await Appointment.find({ patient: patientId })
      .populate('doctor')
      .sort({ date: -1, timeSlot: 1 });
  }

  // Get appointments for a doctor with status & date filtering and time slot sorting
  async getDoctorAppointments(doctorId, statusFilter = '', sortBy = 'time_asc', dateFilter = '') {
    const query = { doctor: doctorId };
    if (statusFilter) {
      query.status = statusFilter;
    }
    if (dateFilter) {
      query.date = dateFilter;
    }

    let sortObj = { date: 1, timeSlot: 1 };
    if (sortBy === 'time_desc') {
      sortObj = { date: 1, timeSlot: -1 };
    } else if (sortBy === 'date_desc') {
      sortObj = { date: -1, timeSlot: 1 };
    } else if (sortBy === 'date_asc') {
      sortObj = { date: 1, timeSlot: 1 };
    }

    return await Appointment.find(query)
      .populate('patient', 'name email')
      .sort(sortObj);
  }

  // Update appointment status (Accept, Reject, Mark Completed, Cancel)
  async updateStatus(appointmentId, statusInput, doctorNotes = '') {
    let status = statusInput;
    if (status === 'confirmed') status = 'accepted';
    if (status === 'cancelled') status = 'rejected';

    const validStatuses = ['pending', 'accepted', 'rejected', 'completed'];
    if (!validStatuses.includes(status)) {
      throw new Error('Invalid status transition');
    }

    const updateData = { status };
    if (doctorNotes) {
      updateData.doctorNotes = doctorNotes;
    }

    return await Appointment.findByIdAndUpdate(appointmentId, updateData, { new: true });
  }
}

module.exports = new AppointmentService();
