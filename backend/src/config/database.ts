import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

// Database configuration
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/gamingcafe';
const MAX_RETRIES = 5;
const RETRY_DELAY = 5000; // 5 seconds

// Enhanced connection options for production
const connectionOptions = {
  maxPoolSize: 10, // Maximum number of connections in the pool
  serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
  socketTimeoutMS: 45000, // Close connections after 45 seconds of inactivity
  family: 4 // Use IPv4, skip trying IPv6
};

export const connectDB = async (retries = MAX_RETRIES): Promise<void> => {
  try {
    // Set mongoose options for better debugging in development
    if (process.env.NODE_ENV === 'development') {
      mongoose.set('debug', true);
    }

    const conn = await mongoose.connect(MONGODB_URI, connectionOptions);
    
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    console.log(`📊 Database: ${conn.connection.name}`);
    console.log(`🔗 Environment: ${process.env.NODE_ENV || 'development'}`);
    
    // Connection event listeners
    mongoose.connection.on('connected', () => {
      console.log('📡 Mongoose connected to MongoDB');
    });
    
    mongoose.connection.on('error', (err) => {
      console.error('❌ Mongoose connection error:', err);
    });
    
    mongoose.connection.on('disconnected', () => {
      console.log('📡 Mongoose disconnected from MongoDB');
    });
    
  } catch (error) {
    console.error(`❌ Database connection failed (attempts left: ${retries - 1}):`, error);
    
    if (retries > 1) {
      console.log(`🔄 Retrying connection in ${RETRY_DELAY / 1000} seconds...`);
      setTimeout(() => connectDB(retries - 1), RETRY_DELAY);
      return;
    }
    
    console.error('\n🚨 All database connection attempts failed!');
    console.error('💡 Make sure MongoDB is installed and running:');
    console.error('   • Install: brew tap mongodb/brew && brew install mongodb-community');
    console.error('   • Start: brew services start mongodb/brew/mongodb-community');
    console.error('   • Or use MongoDB Atlas: https://www.mongodb.com/atlas');
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
