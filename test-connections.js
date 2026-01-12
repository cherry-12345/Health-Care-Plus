const { MongoClient } = require('mongodb');

// Try different connection formats
const connections = [
  'mongodb+srv://hospitalAdmin:uAmsG3fAT17xQqI0@hospital-realtime-db.60tyks.mongodb.net/hospital-realtime?retryWrites=true&w=majority',
  'mongodb+srv://hospitalAdmin:uAmsG3fAT17xQqI0@hospital-realtime-db.60tyks.mongodb.net/?retryWrites=true&w=majority',
  'mongodb://hospitalAdmin:uAmsG3fAT17xQqI0@hospital-realtime-db.60tyks.mongodb.net:27017/hospital-realtime?ssl=true&authSource=admin'
];

async function testConnections() {
  for (let i = 0; i < connections.length; i++) {
    console.log(`\nTesting connection ${i + 1}...`);
    const client = new MongoClient(connections[i]);
    
    try {
      await client.connect();
      console.log('✅ Connection successful!');
      
      const db = client.db('hospital-realtime');
      const collections = await db.listCollections().toArray();
      console.log('📋 Collections:', collections.map(c => c.name));
      
      await client.close();
      return connections[i]; // Return working connection
    } catch (error) {
      console.log('❌ Failed:', error.message);
      try { await client.close(); } catch {}
    }
  }
  
  console.log('\n❌ All connection attempts failed');
  return null;
}

testConnections();