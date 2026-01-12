import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import Hospital from '@/models/Hospital';
import Doctor from '@/models/Doctor';
import bcrypt from 'bcryptjs';

export async function POST() {
  try {
    await dbConnect();

    // Clear existing data
    console.log('Clearing existing data...');
    await User.deleteMany({});
    await Hospital.deleteMany({});
    await Doctor.deleteMany({});

    // Hash password
    const hashedPassword = await bcrypt.hash('Demo@123', 10);

    // Create demo users
    console.log('Creating demo users...');
    const users = await User.insertMany([
      {
        name: 'Demo User',
        email: 'user@demo.com',
        phone: '9876543210',
        password: hashedPassword,
        role: 'user',
        address: { city: 'Mumbai', state: 'Maharashtra', pincode: '400001' },
        isActive: true,
        isVerified: true,
      },
      {
        name: 'City Hospital Admin',
        email: 'hospital@demo.com',
        phone: '9876543211',
        password: hashedPassword,
        role: 'hospital',
        address: { city: 'Mumbai', state: 'Maharashtra', pincode: '400001' },
        isActive: true,
        isVerified: true,
      },
      {
        name: 'Super Admin',
        email: 'admin@demo.com',
        phone: '9876543212',
        password: hashedPassword,
        role: 'admin',
        address: { city: 'Mumbai', state: 'Maharashtra', pincode: '400001' },
        isActive: true,
        isVerified: true,
      },
      {
        name: 'Apollo Hospital Admin',
        email: 'apollo@demo.com',
        phone: '9876543213',
        password: hashedPassword,
        role: 'hospital',
        address: { city: 'Mumbai', state: 'Maharashtra', pincode: '400050' },
        isActive: true,
        isVerified: true,
      },
      {
        name: 'Max Hospital Admin',
        email: 'max@demo.com',
        phone: '9876543214',
        password: hashedPassword,
        role: 'hospital',
        address: { city: 'Mumbai', state: 'Maharashtra', pincode: '400069' },
        isActive: true,
        isVerified: true,
      },
    ]);

    // Create demo hospitals
    console.log('Creating demo hospitals...');
    const hospitals = await Hospital.insertMany([
      {
        userId: users[1]._id,
        name: 'City General Hospital',
        registrationNumber: 'HOS-2024-001',
        type: 'government',
        description: 'A leading government hospital providing quality healthcare services to the community with state-of-the-art facilities.',
        address: {
          street: '123 Medical Road, Sector 5',
          city: 'Mumbai',
          state: 'Maharashtra',
          pincode: '400001',
        },
        location: {
          type: 'Point',
          coordinates: [72.8777, 19.0760],
        },
        contact: {
          phone: '022-12345678',
          emergency: '022-12345679',
          email: 'info@cityhospital.com',
        },
        beds: {
          general: { total: 200, occupied: 150, available: 50 },
          icu: { total: 50, occupied: 35, available: 15 },
          oxygen: { total: 100, occupied: 60, available: 40 },
          ventilator: { total: 30, occupied: 20, available: 10 },
        },
        bloodBank: [
          { bloodGroup: 'A+', units: 25, lastUpdated: new Date() },
          { bloodGroup: 'A-', units: 10, lastUpdated: new Date() },
          { bloodGroup: 'B+', units: 30, lastUpdated: new Date() },
          { bloodGroup: 'B-', units: 8, lastUpdated: new Date() },
          { bloodGroup: 'AB+', units: 15, lastUpdated: new Date() },
          { bloodGroup: 'AB-', units: 5, lastUpdated: new Date() },
          { bloodGroup: 'O+', units: 40, lastUpdated: new Date() },
          { bloodGroup: 'O-', units: 12, lastUpdated: new Date() },
        ],
        departments: ['Cardiology', 'Neurology', 'Orthopedics', 'Pediatrics', 'Gynecology', 'Emergency Medicine'],
        facilities: ['24/7 Emergency', 'Pharmacy', 'Laboratory', 'Radiology', 'Cafeteria', 'Parking', 'Ambulance Service'],
        rating: { overall: 4.2, totalReviews: 156 },
        isOpen24x7: true,
        hasEmergencyServices: true,
        isApproved: true,
        isActive: true,
        lastBedUpdate: new Date(),
        lastBloodUpdate: new Date(),
      },
      {
        userId: users[3]._id,
        name: 'Apollo Multispecialty Hospital',
        registrationNumber: 'HOS-2024-002',
        type: 'multispecialty',
        description: 'World-class healthcare with cutting-edge technology and expert medical professionals.',
        address: {
          street: '456 Health Avenue, Bandra West',
          city: 'Mumbai',
          state: 'Maharashtra',
          pincode: '400050',
        },
        location: {
          type: 'Point',
          coordinates: [72.8296, 19.0596],
        },
        contact: {
          phone: '022-87654321',
          emergency: '022-87654322',
          email: 'care@apollo.com',
        },
        beds: {
          general: { total: 300, occupied: 200, available: 100 },
          icu: { total: 80, occupied: 50, available: 30 },
          oxygen: { total: 120, occupied: 70, available: 50 },
          ventilator: { total: 50, occupied: 30, available: 20 },
        },
        bloodBank: [
          { bloodGroup: 'A+', units: 50, lastUpdated: new Date() },
          { bloodGroup: 'A-', units: 20, lastUpdated: new Date() },
          { bloodGroup: 'B+', units: 45, lastUpdated: new Date() },
          { bloodGroup: 'B-', units: 15, lastUpdated: new Date() },
          { bloodGroup: 'AB+', units: 25, lastUpdated: new Date() },
          { bloodGroup: 'AB-', units: 10, lastUpdated: new Date() },
          { bloodGroup: 'O+', units: 60, lastUpdated: new Date() },
          { bloodGroup: 'O-', units: 25, lastUpdated: new Date() },
        ],
        departments: ['Cardiology', 'Oncology', 'Neurosurgery', 'Transplant', 'Gastroenterology', 'Pulmonology', 'Nephrology'],
        facilities: ['24/7 Emergency', 'Pharmacy', 'Laboratory', 'MRI', 'CT Scan', 'PET Scan', 'Cafeteria', 'Valet Parking', 'Helipad'],
        rating: { overall: 4.7, totalReviews: 342 },
        isOpen24x7: true,
        hasEmergencyServices: true,
        isApproved: true,
        isActive: true,
        lastBedUpdate: new Date(),
        lastBloodUpdate: new Date(),
      },
      {
        userId: users[4]._id,
        name: 'Max Super Specialty Hospital',
        registrationNumber: 'HOS-2024-003',
        type: 'private',
        description: 'Premium healthcare services with personalized care and advanced medical technology.',
        address: {
          street: '789 Wellness Park, Andheri East',
          city: 'Mumbai',
          state: 'Maharashtra',
          pincode: '400069',
        },
        location: {
          type: 'Point',
          coordinates: [72.8697, 19.1136],
        },
        contact: {
          phone: '022-55556666',
          emergency: '022-55556667',
          email: 'info@maxhospital.com',
        },
        beds: {
          general: { total: 150, occupied: 100, available: 50 },
          icu: { total: 40, occupied: 28, available: 12 },
          oxygen: { total: 60, occupied: 40, available: 20 },
          ventilator: { total: 25, occupied: 15, available: 10 },
        },
        bloodBank: [
          { bloodGroup: 'A+', units: 18, lastUpdated: new Date() },
          { bloodGroup: 'A-', units: 6, lastUpdated: new Date() },
          { bloodGroup: 'B+', units: 22, lastUpdated: new Date() },
          { bloodGroup: 'B-', units: 4, lastUpdated: new Date() },
          { bloodGroup: 'AB+', units: 12, lastUpdated: new Date() },
          { bloodGroup: 'AB-', units: 3, lastUpdated: new Date() },
          { bloodGroup: 'O+', units: 28, lastUpdated: new Date() },
          { bloodGroup: 'O-', units: 8, lastUpdated: new Date() },
        ],
        departments: ['Cardiology', 'Orthopedics', 'Urology', 'ENT', 'Dermatology', 'Psychiatry'],
        facilities: ['24/7 Emergency', 'Pharmacy', 'Laboratory', 'X-Ray', 'Ultrasound', 'Cafeteria', 'Parking'],
        rating: { overall: 4.5, totalReviews: 198 },
        isOpen24x7: true,
        hasEmergencyServices: true,
        isApproved: true,
        isActive: true,
        lastBedUpdate: new Date(),
        lastBloodUpdate: new Date(),
      },
      {
        userId: users[1]._id,
        name: 'LifeCare Trauma Center',
        registrationNumber: 'HOS-2024-004',
        type: 'trauma',
        description: 'Specialized trauma and emergency care center with rapid response teams.',
        address: {
          street: '321 Emergency Lane, Dadar',
          city: 'Mumbai',
          state: 'Maharashtra',
          pincode: '400014',
        },
        location: {
          type: 'Point',
          coordinates: [72.8426, 19.0178],
        },
        contact: {
          phone: '022-99998888',
          emergency: '022-99998889',
          email: 'emergency@lifecare.com',
        },
        beds: {
          general: { total: 80, occupied: 60, available: 20 },
          icu: { total: 30, occupied: 25, available: 5 },
          oxygen: { total: 40, occupied: 35, available: 5 },
          ventilator: { total: 20, occupied: 18, available: 2 },
        },
        bloodBank: [
          { bloodGroup: 'A+', units: 35, lastUpdated: new Date() },
          { bloodGroup: 'A-', units: 15, lastUpdated: new Date() },
          { bloodGroup: 'B+', units: 40, lastUpdated: new Date() },
          { bloodGroup: 'B-', units: 12, lastUpdated: new Date() },
          { bloodGroup: 'AB+', units: 20, lastUpdated: new Date() },
          { bloodGroup: 'AB-', units: 8, lastUpdated: new Date() },
          { bloodGroup: 'O+', units: 55, lastUpdated: new Date() },
          { bloodGroup: 'O-', units: 30, lastUpdated: new Date() },
        ],
        departments: ['Trauma Surgery', 'Emergency Medicine', 'Critical Care', 'Neurosurgery', 'Orthopedic Trauma'],
        facilities: ['24/7 Emergency', 'Trauma ICU', 'Operation Theater', 'Blood Bank', 'Ambulance Fleet', 'Helipad'],
        rating: { overall: 4.8, totalReviews: 89 },
        isOpen24x7: true,
        hasEmergencyServices: true,
        isApproved: true,
        isActive: true,
        lastBedUpdate: new Date(),
        lastBloodUpdate: new Date(),
      },
      {
        userId: users[3]._id,
        name: 'Sunshine Maternity Hospital',
        registrationNumber: 'HOS-2024-005',
        type: 'maternity',
        description: 'Specialized maternity and women healthcare with experienced gynecologists.',
        address: {
          street: '555 Mother Care Road, Powai',
          city: 'Mumbai',
          state: 'Maharashtra',
          pincode: '400076',
        },
        location: {
          type: 'Point',
          coordinates: [72.9052, 19.1196],
        },
        contact: {
          phone: '022-77776666',
          emergency: '022-77776667',
          email: 'care@sunshinematernity.com',
        },
        beds: {
          general: { total: 100, occupied: 70, available: 30 },
          icu: { total: 15, occupied: 8, available: 7 },
          oxygen: { total: 20, occupied: 10, available: 10 },
          ventilator: { total: 10, occupied: 4, available: 6 },
        },
        bloodBank: [
          { bloodGroup: 'A+', units: 20, lastUpdated: new Date() },
          { bloodGroup: 'A-', units: 8, lastUpdated: new Date() },
          { bloodGroup: 'B+', units: 25, lastUpdated: new Date() },
          { bloodGroup: 'B-', units: 6, lastUpdated: new Date() },
          { bloodGroup: 'AB+', units: 10, lastUpdated: new Date() },
          { bloodGroup: 'AB-', units: 4, lastUpdated: new Date() },
          { bloodGroup: 'O+', units: 30, lastUpdated: new Date() },
          { bloodGroup: 'O-', units: 12, lastUpdated: new Date() },
        ],
        departments: ['Obstetrics', 'Gynecology', 'Neonatology', 'Pediatrics', 'Fertility'],
        facilities: ['Labor & Delivery', 'NICU', 'Ultrasound', 'Pharmacy', 'Lactation Support', 'Birthing Suites'],
        rating: { overall: 4.6, totalReviews: 267 },
        isOpen24x7: true,
        hasEmergencyServices: true,
        isApproved: true,
        isActive: true,
        lastBedUpdate: new Date(),
        lastBloodUpdate: new Date(),
      },
    ]);

    // Create demo doctors
    console.log('Creating demo doctors...');
    const doctors = await Doctor.insertMany([
      {
        hospitalId: hospitals[0]._id,
        name: 'Dr. Rajesh Kumar',
        specialization: 'Cardiology',
        qualification: 'MD, DM Cardiology',
        experience: 15,
        consultationFee: 800,
        availableDays: ['Monday', 'Wednesday', 'Friday'],
        availableSlots: [
          { day: 'Monday', startTime: '09:00', endTime: '13:00' },
          { day: 'Wednesday', startTime: '14:00', endTime: '18:00' },
          { day: 'Friday', startTime: '09:00', endTime: '13:00' },
        ],
        rating: 4.8,
        isActive: true,
      },
      {
        hospitalId: hospitals[0]._id,
        name: 'Dr. Priya Sharma',
        specialization: 'Pediatrics',
        qualification: 'MD Pediatrics',
        experience: 10,
        consultationFee: 600,
        availableDays: ['Monday', 'Tuesday', 'Thursday', 'Saturday'],
        availableSlots: [
          { day: 'Monday', startTime: '10:00', endTime: '14:00' },
          { day: 'Tuesday', startTime: '10:00', endTime: '14:00' },
          { day: 'Thursday', startTime: '15:00', endTime: '19:00' },
          { day: 'Saturday', startTime: '09:00', endTime: '13:00' },
        ],
        rating: 4.7,
        isActive: true,
      },
      {
        hospitalId: hospitals[1]._id,
        name: 'Dr. Anil Mehta',
        specialization: 'Oncology',
        qualification: 'MD, DM Medical Oncology',
        experience: 20,
        consultationFee: 1500,
        availableDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        availableSlots: [
          { day: 'Monday', startTime: '09:00', endTime: '17:00' },
          { day: 'Tuesday', startTime: '09:00', endTime: '17:00' },
          { day: 'Wednesday', startTime: '09:00', endTime: '17:00' },
          { day: 'Thursday', startTime: '09:00', endTime: '17:00' },
          { day: 'Friday', startTime: '09:00', endTime: '13:00' },
        ],
        rating: 4.9,
        isActive: true,
      },
      {
        hospitalId: hospitals[1]._id,
        name: 'Dr. Sunita Rao',
        specialization: 'Neurosurgery',
        qualification: 'MCh Neurosurgery',
        experience: 18,
        consultationFee: 2000,
        availableDays: ['Tuesday', 'Thursday', 'Saturday'],
        availableSlots: [
          { day: 'Tuesday', startTime: '10:00', endTime: '14:00' },
          { day: 'Thursday', startTime: '10:00', endTime: '14:00' },
          { day: 'Saturday', startTime: '09:00', endTime: '12:00' },
        ],
        rating: 4.8,
        isActive: true,
      },
      {
        hospitalId: hospitals[2]._id,
        name: 'Dr. Vikram Singh',
        specialization: 'Orthopedics',
        qualification: 'MS Orthopedics',
        experience: 12,
        consultationFee: 1000,
        availableDays: ['Monday', 'Wednesday', 'Friday', 'Saturday'],
        availableSlots: [
          { day: 'Monday', startTime: '09:00', endTime: '13:00' },
          { day: 'Wednesday', startTime: '09:00', endTime: '13:00' },
          { day: 'Friday', startTime: '14:00', endTime: '18:00' },
          { day: 'Saturday', startTime: '10:00', endTime: '14:00' },
        ],
        rating: 4.6,
        isActive: true,
      },
      {
        hospitalId: hospitals[2]._id,
        name: 'Dr. Neha Gupta',
        specialization: 'Dermatology',
        qualification: 'MD Dermatology',
        experience: 8,
        consultationFee: 700,
        availableDays: ['Monday', 'Tuesday', 'Thursday'],
        availableSlots: [
          { day: 'Monday', startTime: '11:00', endTime: '15:00' },
          { day: 'Tuesday', startTime: '11:00', endTime: '15:00' },
          { day: 'Thursday', startTime: '16:00', endTime: '20:00' },
        ],
        rating: 4.5,
        isActive: true,
      },
      {
        hospitalId: hospitals[3]._id,
        name: 'Dr. Arjun Patel',
        specialization: 'Trauma Surgery',
        qualification: 'MS General Surgery, Fellowship in Trauma',
        experience: 14,
        consultationFee: 1200,
        availableDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
        availableSlots: [
          { day: 'Monday', startTime: '08:00', endTime: '20:00' },
        ],
        rating: 4.9,
        isActive: true,
      },
      {
        hospitalId: hospitals[4]._id,
        name: 'Dr. Kavita Desai',
        specialization: 'Obstetrics & Gynecology',
        qualification: 'MD, DNB OB-GYN',
        experience: 16,
        consultationFee: 900,
        availableDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
        availableSlots: [
          { day: 'Monday', startTime: '09:00', endTime: '14:00' },
          { day: 'Tuesday', startTime: '09:00', endTime: '14:00' },
          { day: 'Wednesday', startTime: '09:00', endTime: '14:00' },
          { day: 'Thursday', startTime: '15:00', endTime: '19:00' },
          { day: 'Friday', startTime: '09:00', endTime: '14:00' },
          { day: 'Saturday', startTime: '10:00', endTime: '13:00' },
        ],
        rating: 4.7,
        isActive: true,
      },
      {
        hospitalId: hospitals[4]._id,
        name: 'Dr. Meera Joshi',
        specialization: 'Neonatology',
        qualification: 'MD Pediatrics, DM Neonatology',
        experience: 11,
        consultationFee: 1100,
        availableDays: ['Monday', 'Wednesday', 'Friday'],
        availableSlots: [
          { day: 'Monday', startTime: '10:00', endTime: '16:00' },
          { day: 'Wednesday', startTime: '10:00', endTime: '16:00' },
          { day: 'Friday', startTime: '10:00', endTime: '16:00' },
        ],
        rating: 4.8,
        isActive: true,
      },
    ]);

    return NextResponse.json({
      success: true,
      message: 'Database seeded successfully!',
      data: {
        users: users.length,
        hospitals: hospitals.length,
        doctors: doctors.length,
      },
      credentials: {
        user: { email: 'user@demo.com', password: 'Demo@123' },
        hospital: { email: 'hospital@demo.com', password: 'Demo@123' },
        admin: { email: 'admin@demo.com', password: 'Demo@123' },
      },
    });
  } catch (error) {
    console.error('Seed error:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to seed database' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Send a POST request to seed the database with demo data',
    warning: 'This will delete all existing data!',
  });
}
