// Doctor Management Service & Auto-Seeding
const Doctor = require('../models/Doctor');
const User = require('../models/User');
const Review = require('../models/Review');

class DoctorService {
  // Auto-seed sample clinic doctors if database contains no doctor profiles
  async seedInitialDoctors() {
    try {
      // Ensure any existing doctors in DB created prior to verification flow default to approved unless pending
      await Doctor.updateMany(
        { verificationStatus: { $exists: false } },
        { $set: { isVerified: true, verificationStatus: 'approved' } }
      );

      const count = await Doctor.countDocuments();
      if (count > 0) return;

      const sampleDoctorsData = [
        {
          name: 'Dr. Sarah Jenkins',
          email: 'sarah.jenkins@clinic.com',
          specialization: 'Cardiology',
          qualification: 'MBBS, MD (Cardiology)',
          experienceYears: 12,
          consultationFee: 800,
          bio: 'Specialist in cardiovascular health, preventive cardiology, and hypertension management.',
        },
        {
          name: 'Dr. Rajesh Kumar',
          email: 'rajesh.kumar@clinic.com',
          specialization: 'General Medicine',
          qualification: 'MBBS, DNB (Internal Medicine)',
          experienceYears: 15,
          consultationFee: 500,
          bio: 'Senior physician dedicated to holistic primary care, chronic illness, and diagnostics.',
        },
        {
          name: 'Dr. Elena Rostova',
          email: 'elena.rostova@clinic.com',
          specialization: 'Pediatrics',
          qualification: 'MBBS, MD (Pediatrics)',
          experienceYears: 8,
          consultationFee: 600,
          bio: 'Child health specialist focused on pediatric wellness, vaccinations, and adolescent care.',
        },
        {
          name: 'Dr. Marcus Vance',
          email: 'marcus.vance@clinic.com',
          specialization: 'Dermatology',
          qualification: 'MBBS, DDVL (Dermatology)',
          experienceYears: 10,
          consultationFee: 750,
          bio: 'Expert dermatologist specializing in skin disorders, allergy management, and laser care.',
        },
      ];

      for (const docData of sampleDoctorsData) {
        // Create user account for doctor
        let user = await User.findOne({ email: docData.email });
        if (!user) {
          user = await User.create({
            name: docData.name,
            email: docData.email,
            password: 'DoctorPassword123!', // Standard initial hashed password
            role: 'doctor',
          });
        }

        // Create Doctor profile
        await Doctor.create({
          user: user._id,
          name: docData.name,
          specialization: docData.specialization,
          qualification: docData.qualification,
          experienceYears: docData.experienceYears,
          consultationFee: docData.consultationFee,
          bio: docData.bio,
          workingHours: { start: '09:00', end: '17:00', slotDurationMinutes: 30 },
          isVerified: true,
          verificationStatus: 'approved',
          averageRating: 4.9,
          reviewCount: 2,
        });
      }

      console.log(' Clinic Sample Doctors Auto-Seeded Successfully (4 Doctors).');
    } catch (err) {
      console.error('Failed to seed sample doctors:', err.message);
    }
  }

  // Fetch list of doctors with optional specialization filter and search query (Only return verified doctors)
  async getDoctors(query = {}) {
    await this.seedInitialDoctors();

    const filter = {
      isVerified: true,
      verificationStatus: 'approved',
    };

    if (query.specialization) {
      filter.specialization = query.specialization;
    }

    if (query.search) {
      const searchRegex = new RegExp(query.search.trim(), 'i');
      filter.$and = [
        {
          $or: [{ name: searchRegex }, { specialization: searchRegex }, { qualification: searchRegex }],
        },
      ];
    }

    return await Doctor.find(filter).populate('user', 'name email').sort({ name: 1 });
  }

  // Get single doctor by ID
  async getDoctorById(doctorId) {
    return await Doctor.findById(doctorId).populate('user', 'name email');
  }

  // Get distinct specializations list for filter dropdown
  async getSpecializations() {
    await this.seedInitialDoctors();
    return await Doctor.distinct('specialization');
  }

  // Get reviews for a doctor (Returns empty array for new doctors without mock fallback)
  async getDoctorReviews(doctorId) {
    return await Review.find({ doctor: doctorId }).sort({ createdAt: -1 });
  }

  // Add new patient review and recalculate doctor average rating
  async addDoctorReview({ doctorId, patientUser, rating, comment }) {
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) throw new Error('Doctor not found');

    const numRating = Number(rating);
    if (!numRating || numRating < 1 || numRating > 5) {
      throw new Error('Rating must be between 1 and 5 stars');
    }

    // Create Review
    const review = await Review.create({
      doctor: doctorId,
      patient: patientUser._id || patientUser.id,
      patientName: patientUser.name || 'Verified Patient',
      rating: numRating,
      comment: comment.trim(),
      isVerifiedPatient: true,
    });

    // Recalculate Average Rating for Doctor
    const allReviews = await Review.find({ doctor: doctorId });
    const totalScore = allReviews.reduce((sum, r) => sum + r.rating, 0);
    const avgRating = Number((totalScore / allReviews.length).toFixed(1));

    doctor.averageRating = avgRating;
    doctor.reviewCount = allReviews.length;
    await doctor.save();

    return review;
  }
}

module.exports = new DoctorService();
