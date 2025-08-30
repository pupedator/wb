import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { redisClient } from '../config/redis.js';
import { CacheService } from '../config/redis.js';

// Health check status interface
interface HealthStatus {
  status: 'healthy' | 'unhealthy' | 'degraded';
  timestamp: string;
  uptime: number;
  version: string;
  services: {
    database: ServiceHealth;
    cache: ServiceHealth;
    memory: MemoryHealth;
    cpu: CPUHealth;
  };
  loadBalancer?: {
    instanceId: string;
    weight: number;
  };
}

interface ServiceHealth {
  status: 'healthy' | 'unhealthy';
  responseTime?: number;
  error?: string;
}

interface MemoryHealth {
  used: number;
  free: number;
  total: number;
  percentage: number;
}

interface CPUHealth {
  loadAverage: number[];
  usage?: number;
}

export class HealthController {
  
  // Basic health check endpoint
  static async basicHealth(req: Request, res: Response): Promise<void> {
    try {
      const status = {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        message: 'Service is operational'
      };

      res.status(200).json(status);
    } catch (error) {
      res.status(500).json({
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: error.message
      });
    }
  }

  // Detailed health check with service dependencies
  static async detailedHealth(req: Request, res: Response): Promise<void> {
    const startTime = Date.now();
    
    try {
      const health: HealthStatus = {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        version: process.env.npm_package_version || '1.0.0',
        services: {
          database: await this.checkDatabaseHealth(),
          cache: await this.checkCacheHealth(),
          memory: this.getMemoryHealth(),
          cpu: this.getCPUHealth()
        }
      };

      // Add load balancer info if available
      if (process.env.INSTANCE_ID) {
        health.loadBalancer = {
          instanceId: process.env.INSTANCE_ID,
          weight: parseInt(process.env.LB_WEIGHT || '1')
        };
      }

      // Determine overall health status
      const serviceStatuses = Object.values(health.services).map(service => 
        typeof service === 'object' && 'status' in service ? service.status : 'healthy'
      );
      
      if (serviceStatuses.includes('unhealthy')) {
        health.status = 'unhealthy';
        res.status(503);
      } else if (serviceStatuses.some(status => status === 'degraded')) {
        health.status = 'degraded';
        res.status(200);
      } else {
        res.status(200);
      }

      const responseTime = Date.now() - startTime;
      res.setHeader('X-Response-Time', `${responseTime}ms`);
      res.json(health);

    } catch (error) {
      res.status(500).json({
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: error.message,
        responseTime: Date.now() - startTime
      });
    }
  }

  // Check database connectivity and performance
  private static async checkDatabaseHealth(): Promise<ServiceHealth> {
    const startTime = Date.now();
    
    try {
      // Check MongoDB connection
      if (mongoose.connection.readyState !== 1) {
        return {
          status: 'unhealthy',
          error: 'Database connection not established'
        };
      }

      // Perform a simple query to test responsiveness
      await mongoose.connection.db.admin().ping();
      
      const responseTime = Date.now() - startTime;
      
      return {
        status: responseTime < 100 ? 'healthy' : 'degraded',
        responseTime
      };

    } catch (error) {
      return {
        status: 'unhealthy',
        responseTime: Date.now() - startTime,
        error: error.message
      };
    }
  }

  // Check Redis cache health
  private static async checkCacheHealth(): Promise<ServiceHealth> {
    const startTime = Date.now();
    
    try {
      if (redisClient && redisClient.status === 'ready') {
        // Test Redis with ping
        await redisClient.ping();
        const responseTime = Date.now() - startTime;
        
        return {
          status: responseTime < 50 ? 'healthy' : 'degraded',
          responseTime
        };
      } else {
        // Using memory cache fallback
        const stats = await CacheService.getStats();
        const responseTime = Date.now() - startTime;
        
        return {
          status: stats.type === 'memory' ? 'degraded' : 'unhealthy',
          responseTime,
          error: stats.type === 'memory' ? 'Using memory cache fallback' : 'Cache unavailable'
        };
      }
    } catch (error) {
      return {
        status: 'unhealthy',
        responseTime: Date.now() - startTime,
        error: error.message
      };
    }
  }

  // Get memory usage information
  private static getMemoryHealth(): MemoryHealth {
    const memUsage = process.memoryUsage();
    const totalMemory = memUsage.heapTotal + memUsage.external;
    const usedMemory = memUsage.heapUsed;
    const freeMemory = totalMemory - usedMemory;
    const percentage = (usedMemory / totalMemory) * 100;

    return {
      used: Math.round(usedMemory / 1024 / 1024 * 100) / 100, // MB
      free: Math.round(freeMemory / 1024 / 1024 * 100) / 100, // MB
      total: Math.round(totalMemory / 1024 / 1024 * 100) / 100, // MB
      percentage: Math.round(percentage * 100) / 100
    };
  }

  // Get CPU usage information
  private static getCPUHealth(): CPUHealth {
    const os = require('os');
    
    return {
      loadAverage: os.loadavg(),
      usage: os.cpus().length // Simple metric, could be enhanced with actual CPU usage
    };
  }

  // Readiness check (for Kubernetes/container orchestration)
  static async readinessCheck(req: Request, res: Response): Promise<void> {
    try {
      // Check if all critical services are ready
      const dbReady = mongoose.connection.readyState === 1;
      const cacheReady = redisClient ? redisClient.status === 'ready' : true; // Memory cache is always ready

      if (dbReady && cacheReady) {
        res.status(200).json({
          status: 'ready',
          timestamp: new Date().toISOString()
        });
      } else {
        res.status(503).json({
          status: 'not-ready',
          timestamp: new Date().toISOString(),
          issues: {
            database: !dbReady ? 'Not connected' : 'Ready',
            cache: !cacheReady ? 'Not connected' : 'Ready'
          }
        });
      }
    } catch (error) {
      res.status(503).json({
        status: 'not-ready',
        timestamp: new Date().toISOString(),
        error: error.message
      });
    }
  }

  // Liveness check (for Kubernetes/container orchestration)
  static async livenessCheck(req: Request, res: Response): Promise<void> {
    try {
      // Simple check to ensure the process is alive and responding
      res.status(200).json({
        status: 'alive',
        timestamp: new Date().toISOString(),
        pid: process.pid,
        uptime: process.uptime()
      });
    } catch (error) {
      res.status(500).json({
        status: 'dead',
        timestamp: new Date().toISOString(),
        error: error.message
      });
    }
  }

  // Metrics endpoint for monitoring systems
  static async metrics(req: Request, res: Response): Promise<void> {
    try {
      const metrics = {
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        cpu: process.cpuUsage(),
        eventLoop: {
          delay: await this.getEventLoopDelay()
        },
        database: {
          connectionState: mongoose.connection.readyState,
          collections: await this.getDatabaseMetrics()
        },
        cache: await CacheService.getStats(),
        process: {
          pid: process.pid,
          version: process.version,
          platform: process.platform,
          arch: process.arch
        }
      };

      res.setHeader('Content-Type', 'application/json');
      res.status(200).json(metrics);
    } catch (error) {
      res.status(500).json({
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }

  // Get event loop delay (performance indicator)
  private static async getEventLoopDelay(): Promise<number> {
    return new Promise((resolve) => {
      const start = process.hrtime.bigint();
      setImmediate(() => {
        const delta = process.hrtime.bigint() - start;
        resolve(Number(delta) / 1000000); // Convert to milliseconds
      });
    });
  }

  // Get database metrics
  private static async getDatabaseMetrics(): Promise<any> {
    try {
      const db = mongoose.connection.db;
      const admin = db.admin();
      
      // Get database statistics
      const dbStats = await db.stats();
      const serverStatus = await admin.serverStatus();
      
      return {
        collections: dbStats.collections,
        dataSize: dbStats.dataSize,
        indexSize: dbStats.indexSize,
        storageSize: dbStats.storageSize,
        connections: serverStatus.connections
      };
    } catch (error) {
      return { error: error.message };
    }
  }
}

export default HealthController;
