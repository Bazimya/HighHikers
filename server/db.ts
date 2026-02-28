import mongoose from 'mongoose';

// Production: Require MongoDB Atlas connection string
// Local development: Falls back to local MongoDB
const getMongoUri = () => {
  if (process.env.MONGODB_URI) {
    return process.env.MONGODB_URI;
  }
  
  if (process.env.NODE_ENV === 'production') {
    throw new Error(
      '❌ CRITICAL: MONGODB_URI environment variable is required for production!\n' +
      'Set it to your MongoDB Atlas connection string:\n' +
      'MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/high-hikers'
    );
  }
  
  // Local development fallback
  console.log('⚠️  No MONGODB_URI set. Connecting to local MongoDB...');
  return 'mongodb://localhost:27017/high-hikers';
};

const mongoUri = getMongoUri();

export const connectDB = async () => {
  try {
    await mongoose.connect(mongoUri);
    console.log('✅ MongoDB connected successfully');
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error);
    process.exit(1);
  }
};

export const disconnectDB = async () => {
  try {
    await mongoose.disconnect();
    console.log('MongoDB disconnected');
  } catch (error) {
    console.error('Error disconnecting MongoDB:', error);
  }
};

export default mongoose;
