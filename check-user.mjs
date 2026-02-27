import 'dotenv/config';
import mongoose from 'mongoose';

const mongoUri = process.env.MONGODB_URI;

async function checkUser() {
  try {
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    const db = mongoose.connection.db;
    const usersCollection = db.collection('users');
    
    const user = await usersCollection.findOne({ username: 'kennytonny' });
    
    if (user) {
      console.log('✅ User found in MongoDB Atlas:');
      console.log('  Username:', user.username);
      console.log('  Email:', user.email);
      console.log('  ID:', user._id);
    } else {
      console.log('❌ User "kennytonny" NOT found in MongoDB Atlas');
      console.log('   The user only exists in your local MongoDB, not in Atlas');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

checkUser();
