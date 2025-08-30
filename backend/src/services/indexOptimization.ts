import mongoose from 'mongoose';
import { User } from '../models/User.js';
import { CaseHistory } from '../models/CaseHistory.js';
import { PromoCode } from '../models/PromoCode.js';
import { OTP } from '../models/OTP.js';

// Database index optimization service
export class IndexOptimizationService {
  
  // Create all necessary indexes for optimal performance
  static async createIndexes(): Promise<void> {
    console.log('🔍 Creating database indexes for performance optimization...');

    try {
      // User model indexes
      await this.createUserIndexes();
      
      // Case history indexes
      await this.createCaseHistoryIndexes();
      
      // Promo code indexes
      await this.createPromoCodeIndexes();
      
      // OTP indexes
      await this.createOTPIndexes();
      
      // Create additional composite indexes
      await this.createCompositeIndexes();
      
      console.log('✅ All database indexes created successfully');
    } catch (error) {
      console.error('❌ Error creating database indexes:', error);
      throw error;
    }
  }

  // User model indexes
  private static async createUserIndexes(): Promise<void> {
    const userCollection = User.collection;

    // Email index (unique, already exists but ensure it's optimal)
    await userCollection.createIndex(
      { email: 1 }, 
      { 
        unique: true, 
        background: true,
        name: 'idx_user_email_unique'
      }
    );

    // Role index for admin queries
    await userCollection.createIndex(
      { role: 1 }, 
      { 
        background: true,
        name: 'idx_user_role'
      }
    );

    // Status index for active/banned user queries
    await userCollection.createIndex(
      { status: 1 }, 
      { 
        background: true,
        name: 'idx_user_status'
      }
    );

    // Registration date index for analytics
    await userCollection.createIndex(
      { registrationDate: -1 }, 
      { 
        background: true,
        name: 'idx_user_registration_date'
      }
    );

    // Last login index for user activity analysis
    await userCollection.createIndex(
      { lastLogin: -1 }, 
      { 
        background: true,
        name: 'idx_user_last_login'
      }
    );

    // Email verification status index
    await userCollection.createIndex(
      { emailVerified: 1 }, 
      { 
        background: true,
        name: 'idx_user_email_verified'
      }
    );

    // Compound index for active users by role
    await userCollection.createIndex(
      { status: 1, role: 1 }, 
      { 
        background: true,
        name: 'idx_user_status_role'
      }
    );

    console.log('✅ User indexes created');
  }

  // Case history indexes
  private static async createCaseHistoryIndexes(): Promise<void> {
    const caseHistoryCollection = CaseHistory.collection;

    // User ID and creation date compound index (most common query)
    await caseHistoryCollection.createIndex(
      { userId: 1, createdAt: -1 }, 
      { 
        background: true,
        name: 'idx_case_history_user_date'
      }
    );

    // Case ID index for case-specific queries
    await caseHistoryCollection.createIndex(
      { caseId: 1 }, 
      { 
        background: true,
        name: 'idx_case_history_case_id'
      }
    );

    // Reward rarity index for rarity-based analytics
    await caseHistoryCollection.createIndex(
      { rewardRarity: 1 }, 
      { 
        background: true,
        name: 'idx_case_history_rarity'
      }
    );

    // Creation date index for time-based queries
    await caseHistoryCollection.createIndex(
      { createdAt: -1 }, 
      { 
        background: true,
        name: 'idx_case_history_created_at'
      }
    );

    // Compound index for case analytics
    await caseHistoryCollection.createIndex(
      { caseId: 1, rewardRarity: 1, createdAt: -1 }, 
      { 
        background: true,
        name: 'idx_case_history_analytics'
      }
    );

    console.log('✅ Case history indexes created');
  }

  // Promo code indexes
  private static async createPromoCodeIndexes(): Promise<void> {
    const promoCodeCollection = PromoCode.collection;

    // Code index (unique)
    await promoCodeCollection.createIndex(
      { code: 1 }, 
      { 
        unique: true,
        background: true,
        name: 'idx_promo_code_unique'
      }
    );

    // Active status index
    await promoCodeCollection.createIndex(
      { isActive: 1 }, 
      { 
        background: true,
        name: 'idx_promo_active'
      }
    );

    // Expiry date index for cleanup
    await promoCodeCollection.createIndex(
      { expiryDate: 1 }, 
      { 
        background: true,
        name: 'idx_promo_expiry'
      }
    );

    // Usage count index for analytics
    await promoCodeCollection.createIndex(
      { usageCount: -1 }, 
      { 
        background: true,
        name: 'idx_promo_usage_count'
      }
    );

    // Compound index for active, non-expired codes
    await promoCodeCollection.createIndex(
      { isActive: 1, expiryDate: 1 }, 
      { 
        background: true,
        name: 'idx_promo_active_expiry'
      }
    );

    console.log('✅ Promo code indexes created');
  }

  // OTP indexes
  private static async createOTPIndexes(): Promise<void> {
    const otpCollection = OTP.collection;

    // Email index for OTP lookup
    await otpCollection.createIndex(
      { email: 1 }, 
      { 
        background: true,
        name: 'idx_otp_email'
      }
    );

    // Creation date index for cleanup (TTL-like behavior)
    await otpCollection.createIndex(
      { createdAt: 1 }, 
      { 
        background: true,
        expireAfterSeconds: 900, // 15 minutes TTL\n        name: 'idx_otp_ttl'
      }
    );

    // Compound index for email and expiry
    await otpCollection.createIndex(
      { email: 1, expiresAt: 1 }, 
      { 
        background: true,
        name: 'idx_otp_email_expiry'
      }
    );

    console.log('✅ OTP indexes created');
  }

  // Create additional composite indexes for complex queries
  private static async createCompositeIndexes(): Promise<void> {
    // Create additional collections that might be needed
    
    // Gaming sessions collection (for tracking active gaming sessions)
    const db = mongoose.connection.db;
    
    // Gaming sessions indexes
    try {
      await db.collection('gamingsessions').createIndex(
        { userId: 1, status: 1, startTime: -1 },
        { 
          background: true,
          name: 'idx_gaming_sessions_user_status_time'
        }
      );

      await db.collection('gamingsessions').createIndex(
        { computerStation: 1, status: 1 },
        { 
          background: true,
          name: 'idx_gaming_sessions_station_status'
        }
      );
    } catch (error) {
      console.log('Gaming sessions collection not found, will be created when first used');
    }

    // Bookings collection indexes
    try {
      await db.collection('bookings').createIndex(
        { userId: 1, startTime: 1, status: 1 },
        { 
          background: true,
          name: 'idx_bookings_user_time_status'
        }
      );

      await db.collection('bookings').createIndex(
        { startTime: 1, endTime: 1 },
        { 
          background: true,
          name: 'idx_bookings_time_range'
        }
      );
    } catch (error) {
      console.log('Bookings collection not found, will be created when first used');
    }

    // Audit logs collection indexes
    try {
      await db.collection('auditlogs').createIndex(
        { userId: 1, action: 1, timestamp: -1 },
        { 
          background: true,
          name: 'idx_audit_user_action_time'
        }
      );

      await db.collection('auditlogs').createIndex(
        { timestamp: -1 },
        { 
          background: true,
          expireAfterSeconds: 2592000, // 30 days TTL
          name: 'idx_audit_timestamp_ttl'
        }
      );
    } catch (error) {
      console.log('Audit logs collection not found, will be created when first used');
    }

    console.log('✅ Composite indexes created');
  }

  // Get index information for monitoring
  static async getIndexInfo(): Promise<any> {
    try {
      const collections = ['users', 'casehistories', 'promocodes', 'otps'];
      const indexInfo: any = {};

      for (const collectionName of collections) {
        try {
          const collection = mongoose.connection.db.collection(collectionName);
          const indexes = await collection.listIndexes().toArray();
          indexInfo[collectionName] = indexes;
        } catch (error) {
          indexInfo[collectionName] = { error: 'Collection not found or no indexes' };
        }
      }

      return indexInfo;
    } catch (error) {
      console.error('Error getting index info:', error);
      return { error: error.message };
    }
  }

  // Analyze query performance
  static async analyzeQueryPerformance(): Promise<any> {
    try {
      const db = mongoose.connection.db;
      const stats = await db.admin().serverStatus();
      
      return {
        opcounters: stats.opcounters,
        connections: stats.connections,
        globalLock: stats.globalLock,
        memory: stats.mem,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error analyzing query performance:', error);
      return { error: error.message };
    }
  }

  // Drop all indexes (for maintenance)
  static async dropAllIndexes(): Promise<void> {
    console.log('🗑️ Dropping all custom indexes...');

    try {
      const collections = ['users', 'casehistories', 'promocodes', 'otps'];
      
      for (const collectionName of collections) {
        try {
          const collection = mongoose.connection.db.collection(collectionName);
          await collection.dropIndexes();
          console.log(`✅ Dropped indexes for ${collectionName}`);
        } catch (error) {
          console.log(`⚠️ Could not drop indexes for ${collectionName}:`, error.message);
        }
      }
    } catch (error) {
      console.error('❌ Error dropping indexes:', error);
      throw error;
    }
  }
}

export default IndexOptimizationService;
