import { Request, Response, NextFunction } from 'express';
import { CacheService } from '../config/redis.js';

// Interface for cache options
interface CacheOptions {
  ttl?: number;
  keyGenerator?: (req: Request) => string;
  condition?: (req: Request, res: Response) => boolean;
}

// Default cache key generator
const defaultKeyGenerator = (req: Request): string => {
  const { method, path, query, userId } = req as any;
  const queryString = Object.keys(query)
    .sort()
    .map(key => `${key}=${query[key]}`)
    .join('&');
  
  return CacheService.generateKey(
    'api',
    method,
    path.replace(/\//g, '_'),
    userId || 'anonymous',
    queryString || 'no-query'
  );
};

// Cache middleware factory
export const cache = (options: CacheOptions = {}) => {
  const {
    ttl = 300, // 5 minutes default
    keyGenerator = defaultKeyGenerator,
    condition = () => true
  } = options;

  return async (req: Request, res: Response, next: NextFunction) => {
    // Skip caching for non-GET requests or if condition is not met
    if (req.method !== 'GET' || !condition(req, res)) {
      return next();
    }

    try {
      const cacheKey = keyGenerator(req);
      
      // Try to get cached response
      const cachedResponse = await CacheService.get<{
        statusCode: number;
        data: any;
        headers: Record<string, string>;
      }>(cacheKey);

      if (cachedResponse) {
        // Set cached headers
        Object.entries(cachedResponse.headers).forEach(([key, value]) => {
          res.setHeader(key, value);
        });
        
        // Add cache hit header
        res.setHeader('X-Cache', 'HIT');
        res.setHeader('X-Cache-Key', cacheKey);
        
        return res.status(cachedResponse.statusCode).json(cachedResponse.data);
      }

      // Cache miss - store original res.json and res.status methods
      const originalJson = res.json.bind(res);
      const originalStatus = res.status.bind(res);
      let statusCode = 200;

      // Override res.status to capture status code
      res.status = ((code: number) => {
        statusCode = code;
        return originalStatus(code);
      }) as any;

      // Override res.json to cache the response
      res.json = ((data: any) => {
        // Only cache successful responses
        if (statusCode >= 200 && statusCode < 300) {
          const responseToCache = {
            statusCode,
            data,
            headers: {
              'Content-Type': 'application/json',
              'X-Cache': 'MISS',
              'X-Cache-Key': cacheKey
            }
          };

          // Cache asynchronously (don't wait for it)
          CacheService.set(cacheKey, responseToCache, ttl).catch(err => {
            console.error('Failed to cache response:', err);
          });
        }

        // Set cache miss headers
        res.setHeader('X-Cache', 'MISS');
        res.setHeader('X-Cache-Key', cacheKey);
        
        return originalJson(data);
      }) as any;

      next();
    } catch (error) {
      console.error('Cache middleware error:', error);
      next();
    }
  };
};

// Cache invalidation middleware
export const invalidateCache = (patterns: string[] | string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const patternsArray = Array.isArray(patterns) ? patterns : [patterns];
    
    // Store original response methods
    const originalJson = res.json.bind(res);
    const originalSend = res.send.bind(res);

    // Override response methods to invalidate cache after successful operations
    const invalidateOnSuccess = async () => {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        for (const pattern of patternsArray) {
          await CacheService.del(pattern);
        }
      }
    };

    res.json = ((data: any) => {
      invalidateOnSuccess();
      return originalJson(data);
    }) as any;

    res.send = ((data: any) => {
      invalidateOnSuccess();
      return originalSend(data);
    }) as any;

    next();
  };
};

// Session cache for user sessions
export class SessionCache {
  private static readonly SESSION_TTL = 86400; // 24 hours

  static async setUserSession(userId: string, sessionData: any): Promise<boolean> {
    const key = CacheService.generateKey('session', userId);
    return await CacheService.set(key, sessionData, this.SESSION_TTL);
  }

  static async getUserSession<T>(userId: string): Promise<T | null> {
    const key = CacheService.generateKey('session', userId);
    return await CacheService.get<T>(key);
  }

  static async deleteUserSession(userId: string): Promise<boolean> {
    const key = CacheService.generateKey('session', userId);
    return await CacheService.del(key);
  }
}

// Rate limiting cache
export class RateLimitCache {
  static async incrementRequest(identifier: string, window: number = 60): Promise<number> {
    const key = CacheService.generateKey('ratelimit', identifier);
    
    try {
      const current = (await CacheService.get<number>(key)) || 0;
      const newCount = current + 1;
      await CacheService.set(key, newCount, window);
      return newCount;
    } catch (error) {
      console.error('Rate limit cache error:', error);
      return 0;
    }
  }

  static async resetRequest(identifier: string): Promise<boolean> {
    const key = CacheService.generateKey('ratelimit', identifier);
    return await CacheService.del(key);
  }
}

export default { cache, invalidateCache, CacheService, SessionCache, RateLimitCache };
