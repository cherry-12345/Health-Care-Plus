const { MongoClient } = require('mongodb');

const uri = 'mongodb+srv://hospitalAdmin:uAmsG3fAT17xQqI0@hospital-realtime-db.60tyks.mongodb.net/hospital-realtime?retryWrites=true&w=majority';

async function addTestData() {
  const client = new MongoClient(uri);
  
  try {
    await client.connect();
    console.log('✅ Connected to MongoDB Atlas');
    
    const db = client.db('hospital-realtime');
    
    // Add a test hospital
    const hospital = {
      name: 'City General Hospital',
      type: 'government',
      address: {
        street: '123 Medical Road',
        city: 'Mumbai',
        state: 'Maharashtra',
        pincode: '400001'
      },
      beds: {
        general: { total: 200, occupied: 150, available: 50 },
        icu: { total: 50, occupied: 35, available: 15 }
      },
      bloodBank: [
        { bloodGroup: 'A+', units: 25 },
        { bloodGroup: 'O+', units: 40 }
      ],
      isActive: true,
      createdAt: new Date()
    };
    
    const result = await db.collection('hospitals').insertOne(hospital);
    console.log('✅ Hospital added:', result.insertedId);
    
    // Add a test user
    const user = {
      name: 'Demo User',
      email: 'user@demo.com',
      phone: '9876543210',
      role: 'user',
      isActive: true,
      createdAt: new Date()
    };
    
    const userResult = await db.collection('users').insertOne(user);
    console.log('✅ User added:', userResult.insertedId);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.close();
  }
}

addTestData();