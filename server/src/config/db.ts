import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

export let useMongo = false;

export const connectDB = async (): Promise<boolean> => {
  const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/zypost';
  
  if (process.env.DB_FALLBACK_ONLY === 'true') {
    console.log('⚠️ Forced Fallback mode via DB_FALLBACK_ONLY env. Using JSON database.');
    useMongo = false;
    return false;
  }

  try {
    console.log(`Connecting to MongoDB at: ${mongoURI}...`);
    // Limit connection timeout so it doesn't hang in environments without MongoDB
    await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 3000,
    });
    console.log('✅ MongoDB connected successfully!');
    useMongo = true;
    return true;
  } catch (error: any) {
    console.warn('❌ MongoDB connection failed. Falling back to local JSON database storage.');
    console.warn(`Reason: ${error.message || error}`);
    useMongo = false;
    return false;
  }
};
