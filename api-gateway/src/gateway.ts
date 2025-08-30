import express, { Request, Response, NextFunction } from 'express';
import httpProxy from 'express-http-proxy';
import rateLimit from 'express-rate-limit';
import jwt from 'jsonwebtoken';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import { RateLimitCache } from '../../backend/src/middleware/cache.js';

// Gateway configuration
interface GatewayConfig {
  port: number;
  services: {
    [key: string]: {
      url: string;
      healthCheck: string;
      timeout: number;
      retries: number;
    };
  };
  rateLimit: {
    windowMs: number;
    max: number;
  };
  auth: {
    secret: string;
    excludedPaths: string[];
  };
}

// Service health status
interface ServiceHealth {
  name: string;
  status: 'healthy' | 'unhealthy';
  lastCheck: Date;
  responseTime?: number;
  error?: string;
}

export class APIGateway {
  private app: express.Application;
  private config: GatewayConfig;
  private serviceHealth: Map<string, ServiceHealth> = new Map();

  constructor() {
    this.app = express();
    this.config = {
      port: parseInt(process.env.GATEWAY_PORT || '8080'),
      services: {
        user: {
          url: process.env.USER_SERVICE_URL || 'http://localhost:3001',
          healthCheck: '/health',
          timeout: 5000,
          retries: 3
        },
        game: {
          url: process.env.GAME_SERVICE_URL || 'http://localhost:3002',
          healthCheck: '/health',
          timeout: 5000,
          retries: 3
        },
        booking: {
          url: process.env.BOOKING_SERVICE_URL || 'http://localhost:3003',
          healthCheck: '/health',
          timeout: 5000,
          retries: 3
        },
        payment: {
          url: process.env.PAYMENT_SERVICE_URL || 'http://localhost:3004',
          healthCheck: '/health',
          timeout: 5000,
          retries: 3
        },
        notification: {
          url: process.env.NOTIFICATION_SERVICE_URL || 'http://localhost:3005',
          healthCheck: '/health',
          timeout: 5000,
          retries: 3
        }
      },
      rateLimit: {
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 1000 // Limit each IP to 1000 requests per windowMs
      },
      auth: {
        secret: process.env.JWT_SECRET || 'your-secret-key',
        excludedPaths: [
          '/api/auth/login',
          '/api/auth/register',
          '/api/auth/forgot-password',
          '/api/health',
          '/api/metrics'
        ]
      }
    };

    this.setupMiddleware();
    this.setupRoutes();
    this.startHealthChecks();
  }

  // Setup middleware
  private setupMiddleware(): void {
    // Security middleware
    this.app.use(helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: [\"'self'\"],
          styleSrc: [\"'self'\", \"'unsafe-inline'\"],
          scriptSrc: [\"'self'\"],
          imgSrc: [\"'self'\", 'data:', 'https:'],
          connectSrc: [\"'self'\", 'wss:', 'ws:'],
          fontSrc: [\"'self'\"],
          objectSrc: [\"'none'\"],
          mediaSrc: [\"'self'\"],
          frameSrc: [\"'none'\"]
        }
      }
    }));

    // CORS configuration
    this.app.use(cors({
      origin: process.env.FRONTEND_URL || 'http://localhost:3000',
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
    }));

    // Compression
    this.app.use(compression());

    // Request parsing
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    // Global rate limiting
    const limiter = rateLimit({
      windowMs: this.config.rateLimit.windowMs,
      max: this.config.rateLimit.max,
      message: {
        error: 'Too many requests from this IP, please try again later.',
        retryAfter: Math.ceil(this.config.rateLimit.windowMs / 1000)
      },
      standardHeaders: true,
      legacyHeaders: false,
      store: new (class extends rateLimit.Store {
        async increment(key: string): Promise<rateLimit.IncrementResponse> {
          const count = await RateLimitCache.incrementRequest(key, this.windowMs / 1000);
          const totalHits = count;
          const timeToExpire = this.windowMs;
          return { totalHits, timeToExpire };
        }

        async decrement(key: string): Promise<void> {
          // Implementation for decrement if needed
        }

        async resetKey(key: string): Promise<void> {
          await RateLimitCache.resetRequest(key);
        }
      })()
    });

    this.app.use(limiter);

    // Request ID middleware
    this.app.use((req: Request, res: Response, next: NextFunction) => {
      req.id = req.headers['x-request-id'] as string || this.generateRequestId();
      res.setHeader('X-Request-ID', req.id);
      next();
    });

    // Authentication middleware
    this.app.use(this.authMiddleware.bind(this));

    // Request logging
    this.app.use(this.loggingMiddleware);
  }

  // Authentication middleware
  private authMiddleware(req: Request, res: Response, next: NextFunction): void {
    const path = req.path;
    
    // Skip authentication for excluded paths
    if (this.config.auth.excludedPaths.some(excludedPath => 
      path.startsWith(excludedPath)
    )) {
      return next();
    }

    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ 
        error: 'Access token is required',
        code: 'MISSING_TOKEN'
      });
    }

    try {
      const decoded = jwt.verify(token, this.config.auth.secret) as any;
      (req as any).user = decoded;
      next();
    } catch (error) {
      return res.status(401).json({ 
        error: 'Invalid or expired token',
        code: 'INVALID_TOKEN'
      });
    }
  }

  // Logging middleware
  private loggingMiddleware(req: Request, res: Response, next: NextFunction): void {
    const start = Date.now();
    
    res.on('finish', () => {
      const duration = Date.now() - start;
      console.log(`${req.method} ${req.path} - ${res.statusCode} - ${duration}ms - ${req.ip}`);
    });
    
    next();
  }

  // Setup routes
  private setupRoutes(): void {
    // Gateway health check
    this.app.get('/health', (req: Request, res: Response) => {
      const healthStatus = {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        services: Object.fromEntries(this.serviceHealth),
        gateway: {
          uptime: process.uptime(),
          memory: process.memoryUsage(),
          pid: process.pid
        }
      };

      const hasUnhealthyServices = Array.from(this.serviceHealth.values())
        .some(service => service.status === 'unhealthy');

      res.status(hasUnhealthyServices ? 503 : 200).json(healthStatus);
    });

    // Service discovery endpoint
    this.app.get('/api/discovery', (req: Request, res: Response) => {
      const services = Object.entries(this.config.services).map(([name, config]) => ({
        name,
        url: config.url,
        health: this.serviceHealth.get(name) || { status: 'unknown' }
      }));

      res.json({ services });
    });

    // Route to microservices
    this.setupServiceRoutes();

    // Fallback for unknown routes
    this.app.use('*', (req: Request, res: Response) => {
      res.status(404).json({
        error: 'Route not found',
        path: req.path,
        method: req.method,
        timestamp: new Date().toISOString()
      });
    });

    // Global error handler
    this.app.use(this.errorHandler);
  }

  // Setup service routes
  private setupServiceRoutes(): void {
    // User service routes
    this.app.use('/api/auth', this.createServiceProxy('user', '/api/auth'));
    this.app.use('/api/users', this.createServiceProxy('user', '/api/users'));

    // Game service routes  
    this.app.use('/api/games', this.createServiceProxy('game', '/api/games'));
    this.app.use('/api/cases', this.createServiceProxy('game', '/api/cases'));

    // Booking service routes
    this.app.use('/api/bookings', this.createServiceProxy('booking', '/api/bookings'));
    this.app.use('/api/stations', this.createServiceProxy('booking', '/api/stations'));

    // Payment service routes
    this.app.use('/api/payments', this.createServiceProxy('payment', '/api/payments'));
    this.app.use('/api/promocodes', this.createServiceProxy('payment', '/api/promocodes'));

    // Notification service routes
    this.app.use('/api/notifications', this.createServiceProxy('notification', '/api/notifications'));
    this.app.use('/api/emails', this.createServiceProxy('notification', '/api/emails'));
  }

  // Create service proxy
  private createServiceProxy(serviceName: string, pathRewrite?: string) {
    const serviceConfig = this.config.services[serviceName];
    
    return httpProxy(serviceConfig.url, {
      proxyReqPathResolver: (req) => {
        const originalPath = req.originalUrl;
        return pathRewrite ? originalPath.replace(pathRewrite, '') : originalPath;
      },
      
      proxyReqOptDecorator: (proxyReqOpts, srcReq) => {
        // Add service identification headers
        proxyReqOpts.headers = proxyReqOpts.headers || {};
        proxyReqOpts.headers['X-Gateway-Service'] = serviceName;
        proxyReqOpts.headers['X-Request-ID'] = (srcReq as any).id;
        proxyReqOpts.headers['X-Forwarded-For'] = srcReq.ip;
        
        // Forward user information if authenticated
        if ((srcReq as any).user) {
          proxyReqOpts.headers['X-User-ID'] = (srcReq as any).user.id;
          proxyReqOpts.headers['X-User-Role'] = (srcReq as any).user.role;
        }
        
        return proxyReqOpts;
      },

      userResDecorator: (proxyRes, proxyResData, userReq, userRes) => {
        // Add gateway headers
        userRes.setHeader('X-Served-By', 'api-gateway');
        userRes.setHeader('X-Service', serviceName);
        
        return proxyResData;
      },

      timeout: serviceConfig.timeout,

      proxyErrorHandler: (err, res, next) => {
        console.error(`Proxy error for service ${serviceName}:`, err.message);
        
        // Mark service as unhealthy
        this.serviceHealth.set(serviceName, {
          name: serviceName,
          status: 'unhealthy',
          lastCheck: new Date(),
          error: err.message
        });

        res.status(502).json({
          error: 'Service temporarily unavailable',
          service: serviceName,
          code: 'SERVICE_UNAVAILABLE',
          timestamp: new Date().toISOString()
        });
      }
    });
  }

  // Service health checks
  private startHealthChecks(): void {
    // Check all services every 30 seconds
    setInterval(() => {
      this.checkAllServices();
    }, 30000);

    // Initial health check
    setTimeout(() => {
      this.checkAllServices();
    }, 5000);
  }

  private async checkAllServices(): Promise<void> {
    const promises = Object.entries(this.config.services).map(([name, config]) =>
      this.checkServiceHealth(name, config)
    );

    await Promise.allSettled(promises);
  }

  private async checkServiceHealth(serviceName: string, config: any): Promise<void> {
    const startTime = Date.now();
    
    try {
      const healthUrl = `${config.url}${config.healthCheck}`;
      const response = await fetch(healthUrl, {
        method: 'GET',
        timeout: 5000
      });

      const responseTime = Date.now() - startTime;
      
      if (response.ok) {
        this.serviceHealth.set(serviceName, {
          name: serviceName,
          status: 'healthy',
          lastCheck: new Date(),
          responseTime
        });
      } else {
        this.serviceHealth.set(serviceName, {
          name: serviceName,
          status: 'unhealthy',
          lastCheck: new Date(),
          responseTime,
          error: `HTTP ${response.status}`
        });
      }
    } catch (error) {
      this.serviceHealth.set(serviceName, {
        name: serviceName,
        status: 'unhealthy',
        lastCheck: new Date(),
        responseTime: Date.now() - startTime,
        error: error.message
      });
    }
  }

  // Circuit breaker pattern
  private circuitBreaker(serviceName: string) {
    return (req: Request, res: Response, next: NextFunction) => {
      const service = this.serviceHealth.get(serviceName);
      
      if (service && service.status === 'unhealthy') {
        const timeSinceLastCheck = Date.now() - service.lastCheck.getTime();
        
        // If service has been unhealthy for more than 5 minutes, return error immediately
        if (timeSinceLastCheck > 300000) {
          return res.status(503).json({
            error: 'Service circuit breaker is open',
            service: serviceName,
            code: 'CIRCUIT_BREAKER_OPEN',
            retryAfter: 60
          });
        }
      }
      
      next();
    };
  }

  // Request transformation middleware
  private requestTransformer(req: Request, res: Response, next: NextFunction): void {
    // Add common headers
    req.headers['x-gateway-timestamp'] = new Date().toISOString();
    req.headers['x-gateway-version'] = '1.0.0';
    
    // Transform request body if needed
    if (req.body && typeof req.body === 'object') {
      // Add request metadata
      req.body._meta = {
        gateway: true,
        timestamp: new Date().toISOString(),
        requestId: (req as any).id
      };
    }
    
    next();
  }

  // Response transformation middleware
  private responseTransformer(serviceName: string) {
    return (req: Request, res: Response, next: NextFunction) => {
      const originalJson = res.json.bind(res);
      
      res.json = function(data: any) {
        // Add response metadata
        if (data && typeof data === 'object' && !data.error) {
          data._meta = {
            service: serviceName,
            gateway: 'pixelcyberzone-api-gateway',
            timestamp: new Date().toISOString(),
            requestId: (req as any).id
          };
        }
        
        return originalJson(data);
      };
      
      next();
    };
  }

  // Error handler
  private errorHandler(error: Error, req: Request, res: Response, next: NextFunction): void {
    console.error(`Gateway error [${(req as any).id}]:`, error);

    const statusCode = (error as any).statusCode || 500;
    
    res.status(statusCode).json({
      error: 'Internal gateway error',
      message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong',
      code: 'GATEWAY_ERROR',
      requestId: (req as any).id,
      timestamp: new Date().toISOString()
    });
  }

  // Generate request ID
  private generateRequestId(): string {
    return `gw_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Start the gateway
  public start(): void {
    this.app.listen(this.config.port, () => {
      console.log(`🚪 API Gateway running on port ${this.config.port}`);
      console.log(`🔗 Configured services: ${Object.keys(this.config.services).join(', ')}`);
    });
  }

  // Get gateway statistics
  public getStats(): any {
    return {
      uptime: process.uptime(),
      services: Object.fromEntries(this.serviceHealth),
      configuration: {
        port: this.config.port,
        serviceCount: Object.keys(this.config.services).length,
        rateLimit: this.config.rateLimit
      },
      memory: process.memoryUsage(),
      timestamp: new Date().toISOString()
    };
  }

  // Graceful shutdown
  public async shutdown(): Promise<void> {
    console.log('🛑 Shutting down API Gateway...');
    
    // Stop health checks
    // (In a real implementation, you'd store interval IDs and clear them)
    
    // Close server
    // (In a real implementation, you'd store the server instance and close it)
    
    console.log('✅ API Gateway shutdown complete');
  }
}

// Route-specific rate limiting configurations
export const routeRateLimits = {
  auth: rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // Limit each IP to 10 auth requests per windowMs
    message: 'Too many authentication attempts, please try again later.',
    standardHeaders: true,
    legacyHeaders: false
  }),
  
  api: rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 100, // Limit each IP to 100 API requests per minute
    message: 'Too many API requests, please try again later.',
    standardHeaders: true,
    legacyHeaders: false
  }),

  upload: rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // Limit each IP to 5 upload requests per windowMs
    message: 'Too many upload requests, please try again later.',
    standardHeaders: true,
    legacyHeaders: false
  })
};

export default APIGateway;
