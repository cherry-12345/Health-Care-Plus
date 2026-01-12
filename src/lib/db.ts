import mongoose from 'mongoose';

// NOTE: If you see "Duplicate schema index" warnings, they are from existing indexes 
// in MongoDB Atlas created by previous deployments. These can be safely ignored.
// To remove them permanently, go to MongoDB Atlas and delete the conflicting indexes:
// 1. Go to your MongoDB cluster collections
// 2. Find the "hospitals" collection 
// 3. Go to the "Indexes" tab
// 4. Delete any duplicate indexes for registrationNumber
// Then redeploy the application.

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error(
    'Please define MONGODB_URI in .env.local file\n' +
    'Example: MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database'
  );
}

let cached = (global as any).mongoose;

if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null };
}

export async function connectDB() {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI!, {
      autoIndex: false, // Disable auto indexing to avoid duplicate warnings from old indexes
    }).then((mongoose) => {
      console.log('✅ MongoDB connected successfully');
      return mongoose;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

export default connectDB;
