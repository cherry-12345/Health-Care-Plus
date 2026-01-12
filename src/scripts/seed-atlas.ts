import connectDB from '../lib/db';
import User from '../models/User';
import Hospital from '../models/Hospital';
import Doctor from '../models/Doctor';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';

const seedAtlas = async () => {
  try {
    console.log('🔄 Connecting to MongoDB Atlas...');
    await connectDB();

    console.log('🗑️ Clearing existing data...');
    await User.deleteMany({});
    await Hospital.deleteMany({});
    await Doctor.deleteMany({});

    console.log('👤 Creating users...');
    const hashedPassword = await bcrypt.hash('Demo@123', 10);

    const users = await User.insertMany([
      {
        name: 'Admin User',
        email: 'admin@hospital.com',
        phone: '+919876543210',
        password: hashedPassword,
        role: 'admin',
        isVerified: true,
        isActive: true
      },
      {
        name: 'Apollo Hospital Admin',
        email: 'admin@apollo.com',
        phone: '+919876543211',
        password: hashedPassword,
        role: 'hospital',
        isVerified: true,
        isActive: true
      },
      {
        name: 'Max Hospital Admin',
        email: 'admin@max.com',
        phone: '+919876543212',
        password: hashedPassword,
        role: 'hospital',
        isVerified: true,
        isActive: true
      },
      {
        name: 'John Doe',
        email: 'john@example.com',
        phone: '+919876543213',
        password: hashedPassword,
        role: 'user',
        isVerified: true,
        isActive: true
      }
    ]);

    console.log('🏥 Creating hospitals...');
    const hospitals = await Hospital.insertMany([
      {
        userId: users[1]._id,
        name: 'Apollo Hospital',
        registrationNumber: 'APL-MUM-2024-001',
        type: 'multispecialty',
        description: 'Leading multispecialty hospital with world-class facilities',
        address: {
          street: 'Jubilee Hills',
          city: 'Mumbai',
          state: 'Maharashtra',
          pincode: '400001'
        },
        location: {
          type: 'Point',
          coordinates: [72.8777, 19.0760]
        },
        contact: {
          phone: '+912212345678',
          emergency: '+912212345679',
          email: 'info@apollo.com'
        },
        beds: {
          general: { total: 200, occupied: 120, available: 80 },
          icu: { total: 50, occupied: 30, available: 20 },
          oxygen: { total: 80, occupied: 45, available: 35 },
          ventilator: { total: 25, occupied: 15, available: 10 }
        },
        bloodBank: [
          { bloodGroup: 'A+', units: 25, lastUpdated: new Date() },
          { bloodGroup: 'A-', units: 12, lastUpdated: new Date() },
          { bloodGroup: 'B+', units: 30, lastUpdated: new Date() },
          { bloodGroup: 'B-', units: 8, lastUpdated: new Date() },
          { bloodGroup: 'AB+', units: 15, lastUpdated: new Date() },
          { bloodGroup: 'AB-', units: 5, lastUpdated: new Date() },
          { bloodGroup: 'O+', units: 40, lastUpdated: new Date() },
          { bloodGroup: 'O-', units: 18, lastUpdated: new Date() }
        ],
        departments: ['Cardiology', 'Neurology', 'Oncology', 'Orthopedics'],
        facilities: ['24/7 Emergency', 'ICU', 'Blood Bank', 'Pharmacy'],
        rating: { overall: 4.5, totalReviews: 234 },
        isApproved: true,
        isActive: true,
        lastBedUpdate: new Date(),
        lastBloodUpdate: new Date()
      },
      {
        userId: users[2]._id,
        name: 'Max Super Specialty Hospital',
        registrationNumber: 'MAX-MUM-2024-002',
        type: 'private',
        description: 'Premium healthcare with advanced medical technology',
        address: {
          street: 'Andheri East',
          city: 'Mumbai',
          state: 'Maharashtra',
          pincode: '400069'
        },
        location: {
          type: 'Point',
          coordinates: [72.8697, 19.1136]
        },
        contact: {
          phone: '+912255556666',
          emergency: '+912255556667',
          email: 'info@max.com'
        },
        beds: {
          general: { total: 150, occupied: 90, available: 60 },
          icu: { total: 30, occupied: 18, available: 12 },
          oxygen: { total: 50, occupied: 28, available: 22 },
          ventilator: { total: 15, occupied: 8, available: 7 }
        },
        bloodBank: [
          { bloodGroup: 'A+', units: 20, lastUpdated: new Date() },
          { bloodGroup: 'B+', units: 25, lastUpdated: new Date() },
          { bloodGroup: 'O+', units: 35, lastUpdated: new Date() },
          { bloodGroup: 'O-', units: 15, lastUpdated: new Date() }
        ],
        departments: ['Cardiology', 'Orthopedics', 'Urology', 'ENT'],
        facilities: ['24/7 Emergency', 'ICU', 'Laboratory', 'Radiology'],
        rating: { overall: 4.3, totalReviews: 156 },
        isApproved: true,
        isActive: true,
        lastBedUpdate: new Date(),
        lastBloodUpdate: new Date()
      }
    ]);

    console.log('👨‍⚕️ Creating doctors...');
    await Doctor.insertMany([
      {
        hospitalId: hospitals[0]._id,
        name: 'Dr. Rajesh Kumar',
        specialization: 'Cardiology',
        qualification: 'MBBS, MD (Cardiology)',
        experience: 15,
        consultationFee: 800,
        availableDays: ['Monday', 'Wednesday', 'Friday'],
        availableSlots: [
          { day: 'Monday', startTime: '09:00', endTime: '14:00' },
          { day: 'Wednesday', startTime: '14:00', endTime: '18:00' },
          { day: 'Friday', startTime: '09:00', endTime: '14:00' }
        ],
        rating: 4.8,
        isActive: true
      },
      {
        hospitalId: hospitals[1]._id,
        name: 'Dr. Priya Sharma',
        specialization: 'Orthopedics',
        qualification: 'MBBS, MS (Orthopedics)',
        experience: 12,
        consultationFee: 600,
        availableDays: ['Tuesday', 'Thursday', 'Saturday'],
        availableSlots: [
          { day: 'Tuesday', startTime: '10:00', endTime: '15:00' },
          { day: 'Thursday', startTime: '10:00', endTime: '15:00' },
          { day: 'Saturday', startTime: '09:00', endTime: '13:00' }
        ],
        rating: 4.6,
        isActive: true
      }
    ]);

    console.log('✅ MongoDB Atlas seeded successfully!');
    console.log('📊 Summary:');
    console.log('   - Users: 4 (1 admin, 2 hospital, 1 user)');
    console.log('   - Hospitals: 2');
    console.log('   - Doctors: 2');
    console.log('\n🔑 Login Credentials:');
    console.log('   Admin: admin@hospital.com / Demo@123');
    console.log('   Apollo: admin@apollo.com / Demo@123');
    console.log('   Max: admin@max.com / Demo@123');
    console.log('   User: john@example.com / Demo@123');

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
};

seedAtlas();