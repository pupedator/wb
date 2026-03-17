import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/gamingcafe';

async function createAdminUser() {
  try {
    // Connect to database
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: 'admin@gamingcafe.com' });
    if (existingAdmin) {
      console.log('Admin user already exists');
      await mongoose.connection.close();
      return;
    }

    // Create admin user
    await User.create({
      name: 'Admin',
      email: 'admin@gamingcafe.com',
      password: 'admin123456', // This will be hashed automatically
      role: 'admin',
      emailVerified: true,
      status: 'active'
    });

    console.log('Admin user created successfully:');
    console.log('Email: admin@gamingcafe.com');
    console.log('Password: admin123456');
    console.log('Role: admin');
    
    await mongoose.connection.close();
    console.log('Database connection closed');
  } catch (error) {
    console.error('Error creating admin user:', error);
    process.exit(1);
  }
}

createAdminUser();
