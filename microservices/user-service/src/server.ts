import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import dotenv from 'dotenv';
import { initRedis } from '../../../backend/src/config/redis.js';
import { MonitoringService } from '../../../backend/src/services/monitoringService.js';
import { EventService } from '../../../backend/src/services/eventService.js';
import { HealthController } from '../../../backend/src/controllers/healthController.js';
import userRoutes from './routes/userRoutes.js';
import authRoutes from './routes/authRoutes.js';

dotenv.config();

class UserService {
  private app: express.Application;
  private port: number;

  constructor() {
    this.app = express();
    this.port = parseInt(process.env.USER_SERVICE_PORT || '3001');
    
    this.setupMiddleware();
    this.setupRoutes();
    this.setupErrorHandling();
  }

  // Setup middleware
  private setupMiddleware(): void {
    // Security
    this.app.use(helmet());
    this.app.use(cors({
      origin: process.env.FRONTEND_URL || 'http://localhost:3000',
      credentials: true
    }));
    
    // Compression
    this.app.use(compression());
    
    // Body parsing
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true }));
    
    // Performance monitoring
    this.app.use(MonitoringService.requestTrackingMiddleware());
    
    // Service identification
    this.app.use((req, res, next) => {
      res.setHeader('X-Service', 'user-service');
      res.setHeader('X-Service-Version', '1.0.0');
      next();
    });
  }

  // Setup routes
  private setupRoutes(): void {
    // Health checks
    this.app.get('/health', HealthController.basicHealth);
    this.app.get('/health/detailed', HealthController.detailedHealth);
    this.app.get('/ready', HealthController.readinessCheck);
    this.app.get('/live', HealthController.livenessCheck);
    this.app.get('/metrics', HealthController.metrics);

    // Service info
    this.app.get('/info', (req, res) => {
      res.json({
        service: 'user-service',
        version: '1.0.0',
        description: 'User management and authentication service',
        uptime: process.uptime(),
        timestamp: new Date().toISOString()
      });
    });

    // API routes
    this.app.use('/api/auth', authRoutes);
    this.app.use('/api/users', userRoutes);
    
    // Catch-all for undefined routes
    this.app.use('*', (req, res) => {
      res.status(404).json({
        error: 'Route not found',
        service: 'user-service',
        path: req.originalUrl,
        method: req.method
      });
    });
  }

  // Setup error handling
  private setupErrorHandling(): void {
    this.app.use((error: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
      console.error('User Service Error:', error);
      
      res.status(500).json({
        error: 'Internal server error',
        service: 'user-service',
        message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong',
        timestamp: new Date().toISOString()
      });
    });
  }

  // Initialize service
  async initialize(): Promise<void> {
    try {
      console.log('🚀 Starting User Service...');
      
      // Initialize database
      await this.connectDatabase();
      
      // Initialize Redis
      await initRedis();
      
      // Initialize monitoring
      MonitoringService.initialize();
      
      // Initialize event service
      EventService.initialize();
      
      console.log('✅ User Service dependencies initialized');
      
    } catch (error) {
      console.error('❌ User Service initialization failed:', error);
      process.exit(1);
    }
  }

  // Connect to database
  private async connectDatabase(): Promise<void> {
    try {
      const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/pixelcyberzone_users';
      
      await mongoose.connect(mongoUri, {
        dbName: 'pixelcyberzone_users'
      });
      
      console.log('✅ User Service connected to MongoDB');
    } catch (error) {
      console.error('❌ User Service MongoDB connection failed:', error);
      throw error;
    }
  }

  // Start the service
  public start(): void {
    this.app.listen(this.port, () => {
      console.log(`👤 User Service running on port ${this.port}`);
      console.log(`🔗 Environment: ${process.env.NODE_ENV || 'development'}`);
      
      // Emit service started event
      EventService.emitEvent({
        type: 'system.service_started',
        source: 'user-service',
        data: {
          action: 'service_started',
          service: 'user-service',
          details: {
            port: this.port,
            pid: process.pid,
            startTime: new Date()
          }
        }
      });
    });
  }

  // Graceful shutdown
  public async shutdown(): Promise<void> {
    console.log('🛑 Shutting down User Service...');
    
    try {
      // Emit service stopping event
      await EventService.emitEvent({
        type: 'system.service_stopped',
        source: 'user-service',
        data: {
          action: 'service_stopped',
          service: 'user-service',
          details: {
            uptime: process.uptime(),
            stopTime: new Date()
          }
        }
      });
      
      // Close database connection
      await mongoose.connection.close();
      
      // Shutdown other services
      await EventService.shutdown();
      
      console.log('✅ User Service shutdown complete');
      process.exit(0);
      
    } catch (error) {
      console.error('❌ User Service shutdown error:', error);
      process.exit(1);
    }
  }
}

// Handle graceful shutdown
process.on('SIGTERM', async () => {
  await userService.shutdown();
});

process.on('SIGINT', async () => {
  await userService.shutdown();
});

// Start the service
const userService = new UserService();
await userService.initialize();
userService.start();

export default UserService;
