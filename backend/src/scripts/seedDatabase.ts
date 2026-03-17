#!/usr/bin/env ts-node
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { User } from '../models/User';
import { PromoCode } from '../models/PromoCode';
import { connectDB } from '../config/database';

// Load environment variables
dotenv.config();

interface SeedOptions {
  dropFirst?: boolean;
  skipExisting?: boolean;
}

class DatabaseSeeder {
  async seedAdmin(options: SeedOptions = {}) {
    try {
      console.log('🌱 Seeding admin user...');
      
      // Check if admin already exists
      const existingAdmin = await User.findOne({ email: 'admin@gamingcafe.com' });
      
      if (existingAdmin) {
        if (options.skipExisting) {
          console.log('ℹ️  Admin user already exists, skipping...');
          return existingAdmin;
        } else {
          console.log('🔄 Admin user exists, updating...');
          await User.findByIdAndDelete(existingAdmin._id);
        }
      }

      // Create admin user
      const adminUser = new User({
        name: 'Admin',
        email: 'admin@gamingcafe.com',
        password: process.env.ADMIN_PASSWORD || 'Admin123!@#',
        role: 'admin',
        status: 'active',
        emailVerified: true,
        registrationDate: new Date(),
        lastLogin: new Date()
      });

      const savedAdmin = await adminUser.save();
      console.log('✅ Admin user created successfully:', savedAdmin.email);
      return savedAdmin;

    } catch (error) {
      console.error('❌ Error seeding admin user:', error);
      throw error;
    }
  }

  async seedSampleData(adminId: string, options: SeedOptions = {}) {
    try {
      console.log('🌱 Seeding sample data...');

      // Sample promo codes
      const samplePromoCodes = [
        {
          code: 'WELCOME2024',
          caseId: 'starter-pack',
          status: 'active',
          createdBy: adminId,
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
        },
        {
          code: 'NEWPLAYER',
          caseId: 'bronze-case',
          status: 'active',
          createdBy: adminId,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
        },
        {
          code: 'GOLDBONUS',
          caseId: 'gold-case',
          status: 'active',
          createdBy: adminId,
          expiresAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000) // 14 days
        }
      ];

      for (const promoData of samplePromoCodes) {
        const existingPromo = await PromoCode.findOne({ code: promoData.code });
        
        if (existingPromo) {
          if (options.skipExisting) {
            console.log(`ℹ️  Promo code ${promoData.code} already exists, skipping...`);
            continue;
          } else {
            await PromoCode.findByIdAndDelete(existingPromo._id);
          }
        }

        const promoCode = new PromoCode(promoData);
        await promoCode.save();
        console.log(`✅ Created promo code: ${promoData.code}`);
      }

    } catch (error) {
      console.error('❌ Error seeding sample data:', error);
      throw error;
    }
  }

  async seedAll(options: SeedOptions = { skipExisting: false }) {
    try {
      console.log('\\n🌱 Starting database seeding...');
      console.log('=' .repeat(50));

      if (options.dropFirst) {
        console.log('🗑️  Dropping existing collections...');
        await this.dropCollections();
      }

      // Seed admin user
      const adminUser = await this.seedAdmin(options);
      
      // Seed sample data
      await this.seedSampleData(adminUser.id, options);

      console.log('\\n✅ Database seeding completed successfully!');
      console.log('=' .repeat(50));
      console.log('📋 Summary:');
      console.log(`   👤 Admin Email: admin@gamingcafe.com`);
      console.log(`   🔑 Admin Password: ${process.env.ADMIN_PASSWORD || 'Admin123!@#'}`);
      console.log('   📦 Sample promo codes created');
      console.log('=' .repeat(50));

    } catch (error) {
      console.error('❌ Database seeding failed:', error);
      process.exit(1);
    }
  }

  async dropCollections() {
    try {
      const db = mongoose.connection.db;
      if (!db) {
        throw new Error('Database connection not established');
      }
      
      const collections = await db.listCollections().toArray();
      
      for (const collection of collections) {
        await db.dropCollection(collection.name);
        console.log(`🗑️  Dropped collection: ${collection.name}`);
      }
    } catch (error) {
      console.error('❌ Error dropping collections:', error);
      throw error;
    }
  }

  async createIndexes() {
    try {
      console.log('🏗️  Creating database indexes...');
      
      // User indexes
      await User.createIndexes();
      console.log('✅ User indexes created');
      
      // PromoCode indexes
      await PromoCode.createIndexes();
      console.log('✅ PromoCode indexes created');

      console.log('✅ All indexes created successfully');
    } catch (error) {
      console.error('❌ Error creating indexes:', error);
      throw error;
    }
  }
}

// CLI interface
async function main() {
  try {
    // Parse command line arguments
    const args = process.argv.slice(2);
    const dropFirst = args.includes('--drop');
    const skipExisting = args.includes('--skip-existing');
    const adminOnly = args.includes('--admin-only');
    const indexesOnly = args.includes('--indexes-only');

    // Connect to database and wait for it to be ready
    await connectDB();
    
    // Wait a moment for connection to stabilize
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const seeder = new DatabaseSeeder();

    if (indexesOnly) {
      await seeder.createIndexes();
    } else if (adminOnly) {
      await seeder.seedAdmin({ skipExisting });
    } else {
      await seeder.seedAll({ dropFirst, skipExisting });
      await seeder.createIndexes();
    }

    console.log('🎉 Operation completed successfully!');
    await mongoose.connection.close();
    process.exit(0);

  } catch (error) {
    console.error('❌ Seeding failed:', error);
    await mongoose.connection.close();
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

export default DatabaseSeeder;
