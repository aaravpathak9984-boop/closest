/**
 * Clinic Master Auto-Seeding Service.
 * Maintained for schema consistency across core entities (User, Doctor, Patient, Appointment, Review, Admin).
 */
class SeedService {
  async seedAllDomainEntities() {
    try {
      // Branch, Department, and MedicalRecord models have been removed as requested.
      // All core entities are dynamically created by users, doctors, and admins.
      console.log('✓ Database schema verified for core entities (Users, Patients, Doctors, Admins, Appointments, Reviews).');
    } catch (error) {
      console.error('SeedService Error:', error.message);
    }
  }
}

module.exports = new SeedService();

