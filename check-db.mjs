import mongoose from 'mongoose';
import { config } from 'dotenv';

// Load environment variables
config({ path: '.env.local' });

const MONGODB_URI = process.env.MONGODB_URI;

async function checkDatabase() {
  try {
    console.log('🔄 Connecting to MongoDB...');
    
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 10000,
      connectTimeoutMS: 10000,
    });
    
    console.log('✅ Connected to MongoDB successfully!');
    
    const db = mongoose.connection.db;
    
    // List all collections
    const collections = await db.listCollections().toArray();
    console.log('\n📋 Collections found:', collections.map(c => c.name));
    
    // Check document counts
    console.log('\n📊 Document counts:');
    
    const userCount = await db.collection('users').countDocuments();
    console.log(`👥 Users: ${userCount}`);
    
    const hospitalCount = await db.collection('hospitals').countDocuments();
    console.log(`🏥 Hospitals: ${hospitalCount}`);
    
    const doctorCount = await db.collection('doctors').countDocuments();
    console.log(`👨⚕️ Doctors: ${doctorCount}`);
    
    const appointmentCount = await db.collection('appointments').countDocuments();
    console.log(`📅 Appointments: ${appointmentCount}`);
    
    const reviewCount = await db.collection('reviews').countDocuments();
    console.log(`⭐ Reviews: ${reviewCount}`);
    
    const totalDocuments = userCount + hospitalCount + doctorCount + appointmentCount + reviewCount;
    
    if (totalDocuments === 0) {
      console.log('\n❌ NO DATA FOUND - Database is empty');
      console.log('\n💡 To populate with demo data, run:');
      console.log('   npm run seed');
    } else {
      console.log(`\n✅ DATA FOUND - Total documents: ${totalDocuments}`);
      
      // Show sample data
      if (hospitalCount > 0) {
        console.log('\n🏥 Sample hospital:');
        const sampleHospital = await db.collection('hospitals').findOne({}, {
          projection: { name: 1, 'address.city': 1, 'beds.general.available': 1, 'beds.icu.available': 1 }
        });
        console.log(JSON.stringify(sampleHospital, null, 2));
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
  }
}

checkDatabase();