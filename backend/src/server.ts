import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { connectDB } from './config/database.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';
import { initRedis, closeRedis } from './config/redis.js';
import { cache } from './middleware/cache.js';
import { MonitoringService } from './services/monitoringService.js';
import { EventService } from './services/eventService.js';
import { QueueService } from './services/queueService.js';
import { WebSocketService } from './services/websocketService.js';
import { CDNService } from './services/cdnService.js';
import { IndexOptimizationService } from './services/indexOptimization.js';
import { HealthController } from './controllers/healthController.js';

// Import routes
import authRoutes from './routes/auth.js';
import casesRoutes from './routes/cases.js';
import promoCodeRoutes from './routes/promoCodes.js';

// Load environment variables
dotenv.config();

const app = express();
const httpServer = createServer(app);
const PORT = process.env.PORT || 3001;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

// Initialize WebSocket service
let websocketService: WebSocketService;

// Trust proxy for rate limiting when behind reverse proxy
app.set('trust proxy', 1);

// Security middleware
app.use(helmet({
  crossOriginEmbedderPolicy: false,
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'), // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(limiter);

// CORS configuration
app.use(cors({
  origin: [
    FRONTEND_URL,
    'http://localhost:3000',
    'http://localhost:5173',
    'http://127.0.0.1:5173',
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Body parsing middleware
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Performance monitoring middleware
app.use(MonitoringService.requestTrackingMiddleware());

// Cache middleware for GET requests
app.use(cache({ ttl: 300 }));

// Health check endpoints
app.get('/health', HealthController.basicHealth);
app.get('/health/detailed', HealthController.detailedHealth);
app.get('/ready', HealthController.readinessCheck);
app.get('/live', HealthController.livenessCheck);
app.get('/metrics', HealthController.metrics);

// Prometheus metrics endpoint
app.get('/prometheus', async (req, res) => {
  try {
    const metrics = await MonitoringService.getPrometheusMetrics();
    res.set('Content-Type', 'text/plain');
    res.send(metrics);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get metrics' });
  }
});

// Performance dashboard endpoint
app.get('/dashboard', (req, res) => {
  try {
    const dashboard = MonitoringService.getPerformanceDashboard();
    res.json(dashboard);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get dashboard data' });
  }
});

// Event statistics endpoint
app.get('/events/stats', (req, res) => {
  try {
    const stats = EventService.getEventStatistics();
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get event statistics' });
  }
});

// Queue statistics endpoint
app.get('/queues/stats', async (req, res) => {
  try {
    const stats = await QueueService.getQueueStats();
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get queue statistics' });
  }
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/cases', casesRoutes);
app.use('/api/promo-codes', promoCodeRoutes);

// 404 handler
app.use(notFound);

// Global error handler
app.use(errorHandler);

// Start server with full enterprise stack
const startServer = async (): Promise<void> => {
  try {
    console.log('🚀 Starting PixelCyberZone Enterprise Server...');
    
    // 1. Initialize Redis cache
    console.log('📡 Initializing Redis cache...');
    await initRedis();
    
    // 2. Connect to database
    console.log('🗄️ Connecting to database...');
    await connectDB();
    
    // 3. Optimize database indexes
    console.log('🔍 Optimizing database indexes...');
    await IndexOptimizationService.createIndexes();
    
    // 4. Initialize monitoring
    console.log('📊 Initializing performance monitoring...');
    MonitoringService.initialize();
    
    // 5. Initialize event-driven architecture
    console.log('🎯 Initializing event system...');
    EventService.initialize();
    
    // 6. Initialize message queues
    console.log('📬 Initializing message queues...');
    await QueueService.initialize();
    await QueueService.scheduleRecurringJobs();
    
    // 7. Initialize CDN service
    console.log('🌐 Initializing CDN service...');
    await CDNService.initialize();
    
    // 8. Initialize WebSocket service
    console.log('🔌 Initializing WebSocket service...');
    websocketService = new WebSocketService(httpServer);
    
    // 9. Start HTTP server
    httpServer.listen(PORT, () => {
      console.log('\n🎉 PixelCyberZone Enterprise Server Started Successfully!');
      console.log('=' .repeat(60));
      console.log(`🌐 Server: http://localhost:${PORT}`);
      console.log(`🔗 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🎯 Frontend: ${FRONTEND_URL}`);
      console.log('\n📋 Available Endpoints:');
      console.log(`  🏥 Health Check: http://localhost:${PORT}/health`);
      console.log(`  📊 Detailed Health: http://localhost:${PORT}/health/detailed`);
      console.log(`  📈 Metrics: http://localhost:${PORT}/metrics`);
      console.log(`  📊 Prometheus: http://localhost:${PORT}/prometheus`);
      console.log(`  📋 Dashboard: http://localhost:${PORT}/dashboard`);
      console.log(`  🎯 Events: http://localhost:${PORT}/events/stats`);
      console.log(`  📬 Queues: http://localhost:${PORT}/queues/stats`);
      console.log('\n🔗 API Routes:');
      console.log(`  🔐 Auth: http://localhost:${PORT}/api/auth`);
      console.log(`  🎁 Cases: http://localhost:${PORT}/api/cases`);
      console.log(`  🎫 Promo Codes: http://localhost:${PORT}/api/promo-codes`);
      console.log('\n🔌 WebSocket: ws://localhost:' + PORT);
      console.log('=' .repeat(60));
      
      // Emit server started event
      EventService.emitEvent({
        type: 'system.service_started',
        source: 'main-server',
        data: {
          action: 'service_started',
          service: 'main-server',
          details: {
            port: PORT,
            environment: process.env.NODE_ENV || 'development',
            pid: process.pid,
            startTime: new Date()
          }
        }
      });
    });
    
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    await gracefulShutdown();
    process.exit(1);
  }
};

// Graceful shutdown
const gracefulShutdown = async (): Promise<void> => {
  console.log('\n🛑 Shutting down PixelCyberZone Enterprise Server...');
  
  try {
    // Emit shutdown event
    await EventService.emitEvent({
      type: 'system.service_stopped',
      source: 'main-server',
      data: {
        action: 'service_stopped',
        service: 'main-server',
        details: {
          uptime: process.uptime(),
          stopTime: new Date()
        }
      }
    });
    
    // Shutdown WebSocket service
    if (websocketService) {
      await websocketService.shutdown();
    }
    
    // Shutdown queue service
    await QueueService.shutdown();
    
    // Shutdown event service
    await EventService.shutdown();
    
    // Close database connection
    await connectDB().then(() => console.log('🗄️ Database connection closed'));
    
    // Close Redis connection
    await closeRedis();
    
    console.log('✅ Graceful shutdown completed');
    
  } catch (error) {
    console.error('❌ Error during shutdown:', error);
    process.exit(1);
  }
};

// Handle graceful shutdown signals
process.on('SIGTERM', async () => {
  console.log('\n📡 Received SIGTERM signal');
  await gracefulShutdown();
});

process.on('SIGINT', async () => {
  console.log('\n📡 Received SIGINT signal');
  await gracefulShutdown();
});

// Handle uncaught exceptions
process.on('uncaughtException', async (error) => {
  console.error('❌ Uncaught Exception:', error);
  await gracefulShutdown();
  process.exit(1);
});

process.on('unhandledRejection', async (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  await gracefulShutdown();
  process.exit(1);
});

// Start the server
startServer();

export default app;
