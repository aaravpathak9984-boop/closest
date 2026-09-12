/**
 * Clinic Master Auto-Seeding Service.
 * Ensures Branch, Department, MedicalRecord, Doctor, Patient, and Admin collections
 * are populated and linked cleanly in MongoDB database.
 */
const Branch = require('../models/Branch');
const Department = require('../models/Department');
const MedicalRecord = require('../models/MedicalRecord');
const Doctor = require('../models/Doctor');
const User = require('../models/User');

class SeedService {
  async seedAllDomainEntities() {
    try {
      // 1. Seed Clinic Branches
      const branchCount = await Branch.countDocuments();
      if (branchCount === 0) {
        await Branch.create([
          {
            branchName: 'Central Healthcare Super-Specialty',
            city: 'New Delhi',
            address: '42 Healthcare Boulevard, Connaught Place, New Delhi',
            emergencyPhone: '+91 1800-123-4567',
            operatingHours: '24/7 Emergency & OPD 08:00 - 20:00',
            activeDoctorsCount: 12,
          },
          {
            branchName: 'Metro Medical Hub & Emergency Center',
            city: 'Mumbai',
            address: '108 Marine Drive, Nariman Point, Mumbai',
            emergencyPhone: '+91 1800-987-6543',
            operatingHours: '24/7 Emergency & Trauma Center',
            activeDoctorsCount: 18,
          },
          {
            branchName: 'South City Care Clinic',
            city: 'Bengaluru',
            address: '15 Indiranagar 100ft Main Rd, Bengaluru',
            emergencyPhone: '+91 1800-555-0199',
            operatingHours: 'OPD 09:00 - 21:00 Daily',
            activeDoctorsCount: 8,
          },
        ]);
        console.log('✓ Clinic Branches auto-seeded in MongoDB.');
      }

      // 2. Seed Medical Departments
      const deptCount = await Department.countDocuments();
      if (deptCount === 0) {
        await Department.create([
          {
            name: 'Cardiology',
            code: 'CARD',
            description: 'Comprehensive cardiovascular care, ECG, echo, and preventive cardiac health.',
            icon: '🫀',
            headDoctorName: 'Dr. Sarah Jenkins',
            floorLocation: '2nd Floor Block A',
            isActive: true,
          },
          {
            name: 'General Medicine',
            code: 'GENMED',
            description: 'Primary care, holistic wellness, chronic disease management, and internal medicine.',
            icon: '🩺',
            headDoctorName: 'Dr. Rajesh Kumar',
            floorLocation: '1st Floor OPD Wing',
            isActive: true,
          },
          {
            name: 'Pediatrics',
            code: 'PED',
            description: 'Specialized medical care, immunizations, and wellness tracking for infants & adolescents.',
            icon: '👶',
            headDoctorName: 'Dr. Elena Rostova',
            floorLocation: '3rd Floor Block B',
            isActive: true,
          },
          {
            name: 'Dermatology',
            code: 'DERM',
            description: 'Advanced skin treatments, allergies, laser therapy, and cosmetic dermatology.',
            icon: '🧴',
            headDoctorName: 'Dr. Marcus Vance',
            floorLocation: '2nd Floor Block B',
            isActive: true,
          },
          {
            name: 'Orthopedics',
            code: 'ORTHO',
            description: 'Bone, joint, joint replacement, sports injury care, and physical therapy.',
            icon: '🦴',
            headDoctorName: 'Dr. Vikram Sethi',
            floorLocation: '4th Floor Block A',
            isActive: true,
          },
          {
            name: 'Neurology',
            code: 'NEURO',
            description: 'Brain, nerve, stroke treatment, headache clinic, and neuro-diagnostics.',
            icon: '🧠',
            headDoctorName: 'Dr. Rahul Pratap Singh',
            floorLocation: '5th Floor Block A',
            isActive: true,
          },
        ]);
        console.log('✓ Clinic Departments auto-seeded in MongoDB.');
      }

      // 3. Seed Medical Records & Prescriptions
      const recordCount = await MedicalRecord.countDocuments();
      if (recordCount === 0) {
        const doctor = await Doctor.findOne();
        const patientUser = await User.findOne({ role: 'patient' }) || await User.findOne();

        if (doctor && patientUser) {
          await MedicalRecord.create([
            {
              patient: patientUser._id,
              doctor: doctor._id,
              patientName: patientUser.name,
              diagnosis: 'Acute Upper Respiratory Tract Infection',
              prescriptions: [
                { medicineName: 'Amoxicillin 500mg', dosage: '1 capsule 3 times daily after meals', durationDays: 5 },
                { medicineName: 'Paracetamol 650mg', dosage: '1 tablet as needed for fever', durationDays: 3 },
                { medicineName: 'Cetirizine 10mg', dosage: '1 tablet at bedtime', durationDays: 5 },
              ],
              labTestsRecommended: ['Complete Blood Count (CBC)', 'Chest X-Ray PA View'],
              doctorNotes: 'Patient advised warm fluid hydration, 5 days vocal rest, and follow-up if fever persists above 101°F.',
              visitDate: '2026-09-10',
              status: 'active',
            },
            {
              patient: patientUser._id,
              doctor: doctor._id,
              patientName: patientUser.name,
              diagnosis: 'Essential Hypertension & Routine Wellness Check',
              prescriptions: [
                { medicineName: 'Telmisartan 40mg', dosage: '1 tablet once daily morning', durationDays: 30 },
              ],
              labTestsRecommended: ['Fasting Blood Sugar', 'Lipid Profile', 'Serum Creatinine'],
              doctorNotes: 'Blood pressure recorded 135/85 mmHg. Continue low sodium diet and 30 min daily walking.',
              visitDate: '2026-08-25',
              status: 'completed',
            },
          ]);
          console.log('✓ Medical Records & Prescriptions auto-seeded in MongoDB.');
        }
      }
    } catch (error) {
      console.error('SeedService Error:', error.message);
    }
  }
}

module.exports = new SeedService();
