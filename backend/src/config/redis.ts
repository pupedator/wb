import Redis from 'ioredis';
import NodeCache from 'node-cache';

// Redis configuration interface
interface RedisConfig {
  host: string;
  port: number;
  password?: string;
  retryDelayOnFailover: number;
  maxRetriesPerRequest: number;
  db: number;
}

// Redis client instance
let redisClient: Redis | null = null;

// Fallback in-memory cache for development
const memoryCache = new NodeCache({ 
  stdTTL: 600, // 10 minutes default TTL
  checkperiod: 120 // Check for expired keys every 2 minutes
});

// Initialize Redis connection
export const initRedis = async (): Promise<void> => {
  try {
    const config: RedisConfig = {
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      password: process.env.REDIS_PASSWORD,
      retryDelayOnFailover: 100,
      maxRetriesPerRequest: 3,
      db: parseInt(process.env.REDIS_DB || '0')
    };

    redisClient = new Redis(config);

    redisClient.on('connect', () => {
      console.log('✅ Redis connected successfully');
    });

    redisClient.on('error', (err) => {
      console.error('❌ Redis connection error:', err.message);
      // Don't throw error, fallback to memory cache
    });

    redisClient.on('close', () => {
      console.log('🔌 Redis connection closed');
    });

    // Test connection
    await redisClient.ping();
    console.log('🏓 Redis ping successful');

  } catch (error) {
    console.error('❌ Redis initialization failed, using memory cache fallback:', error);
    redisClient = null;
  }
};

// Cache service with Redis fallback to memory
export class CacheService {
  // Set a value in cache
  static async set(key: string, value: any, ttl: number = 600): Promise<boolean> {
    try {
      const serializedValue = JSON.stringify(value);
      
      if (redisClient && redisClient.status === 'ready') {
        await redisClient.setex(key, ttl, serializedValue);
        return true;
      } else {
        // Fallback to memory cache
        memoryCache.set(key, serializedValue, ttl);
        return true;
      }
    } catch (error) {
      console.error('Cache set error:', error);
      return false;
    }
  }

  // Get a value from cache
  static async get<T>(key: string): Promise<T | null> {
    try {
      let value: string | null = null;

      if (redisClient && redisClient.status === 'ready') {
        value = await redisClient.get(key);
      } else {
        // Fallback to memory cache
        value = memoryCache.get<string>(key) || null;
      }

      if (value) {
        return JSON.parse(value) as T;
      }
      return null;
    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  }

  // Delete a value from cache
  static async del(key: string): Promise<boolean> {
    try {
      if (redisClient && redisClient.status === 'ready') {
        await redisClient.del(key);
      } else {
        memoryCache.del(key);
      }
      return true;
    } catch (error) {
      console.error('Cache delete error:', error);
      return false;
    }
  }

  // Clear all cache
  static async clear(): Promise<boolean> {
    try {
      if (redisClient && redisClient.status === 'ready') {
        await redisClient.flushdb();
      } else {
        memoryCache.flushAll();
      }
      return true;
    } catch (error) {
      console.error('Cache clear error:', error);
      return false;
    }
  }

  // Get cache statistics
  static async getStats(): Promise<any> {
    try {
      if (redisClient && redisClient.status === 'ready') {
        const info = await redisClient.info('memory');
        return { type: 'redis', info };
      } else {
        const stats = memoryCache.getStats();
        return { type: 'memory', stats };
      }
    } catch (error) {
      console.error('Cache stats error:', error);
      return { type: 'unavailable', error: error.message };
    }
  }

  // Generate cache key with prefix
  static generateKey(prefix: string, ...parts: string[]): string {
    return `pixelcyberzone:${prefix}:${parts.join(':')}`;
  }
}

// Close Redis connection
export const closeRedis = async (): Promise<void> => {
  if (redisClient) {
    await redisClient.quit();
    redisClient = null;
  }
};

export { redisClient };
