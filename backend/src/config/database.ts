import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/pixelcyberzone';

export const connectDB = async (): Promise<void> => {
  try {
    const conn = await mongoose.connect(MONGODB_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('Database connection failed:', error);
    console.error('Note: Make sure MongoDB is installed and running.');
    console.error('To install MongoDB on macOS: brew tap mongodb/brew && brew install mongodb-community');
    console.error('To start MongoDB: brew services start mongodb/brew/mongodb-community');
    process.exit(1);
  }
};

// Graceful shutdown
process.on('SIGINT', async () => {
  await mongoose.connection.close();
  console.log('Database connection closed.');
  process.exit(0);
});

export default connectDB;
