import { Request, Response, NextFunction } from 'express';
import promClient from 'prom-client';
import { performance } from 'perf_hooks';
import os from 'os';

// Custom metrics interfaces
interface RequestMetrics {
  method: string;
  route: string;
  statusCode: number;
  responseTime: number;
  timestamp: Date;
  userAgent?: string;
  ip?: string;
}

interface SystemMetrics {
  cpuUsage: number[];
  memoryUsage: NodeJS.MemoryUsage;
  eventLoopDelay: number;
  uptime: number;
  timestamp: Date;
}

interface BusinessMetrics {
  activeUsers: number;
  gamingSessions: number;
  revenue: number;
  caseOpenings: number;
  timestamp: Date;
}

export class MonitoringService {
  // Prometheus metrics
  private static httpRequestDuration: promClient.Histogram<string>;
  private static httpRequestsTotal: promClient.Counter<string>;
  private static activeConnections: promClient.Gauge<string>;
  private static systemMemoryUsage: promClient.Gauge<string>;
  private static systemCpuUsage: promClient.Gauge<string>;
  private static eventLoopDelay: promClient.Gauge<string>;
  private static businessMetrics: promClient.Gauge<string>;
  private static databaseConnections: promClient.Gauge<string>;
  private static cacheHitRatio: promClient.Gauge<string>;

  // Internal metrics storage
  private static requestMetrics: RequestMetrics[] = [];
  private static systemMetricsHistory: SystemMetrics[] = [];
  private static businessMetricsHistory: BusinessMetrics[] = [];
  private static alertThresholds: any = {};

  // Initialize monitoring service
  static initialize(): void {
    console.log('📊 Initializing performance monitoring...');

    // Create default metrics registry
    promClient.register.clear();
    promClient.collectDefaultMetrics({
      prefix: 'pixelcyberzone_',
      timeout: 5000,
    });

    // HTTP request duration histogram
    this.httpRequestDuration = new promClient.Histogram({
      name: 'pixelcyberzone_http_request_duration_seconds',
      help: 'Duration of HTTP requests in seconds',
      labelNames: ['method', 'route', 'status_code'],
      buckets: [0.1, 0.3, 0.5, 0.7, 1, 3, 5, 7, 10]
    });

    // HTTP requests total counter
    this.httpRequestsTotal = new promClient.Counter({
      name: 'pixelcyberzone_http_requests_total',
      help: 'Total number of HTTP requests',
      labelNames: ['method', 'route', 'status_code']
    });

    // Active connections gauge
    this.activeConnections = new promClient.Gauge({
      name: 'pixelcyberzone_active_connections',
      help: 'Number of active connections'
    });

    // System memory usage
    this.systemMemoryUsage = new promClient.Gauge({
      name: 'pixelcyberzone_memory_usage_bytes',
      help: 'Memory usage in bytes',
      labelNames: ['type']
    });

    // System CPU usage
    this.systemCpuUsage = new promClient.Gauge({
      name: 'pixelcyberzone_cpu_usage_percent',
      help: 'CPU usage percentage',
      labelNames: ['core']
    });

    // Event loop delay
    this.eventLoopDelay = new promClient.Gauge({
      name: 'pixelcyberzone_event_loop_delay_seconds',
      help: 'Event loop delay in seconds'
    });

    // Business metrics
    this.businessMetrics = new promClient.Gauge({
      name: 'pixelcyberzone_business_metrics',
      help: 'Business-specific metrics',
      labelNames: ['metric_type']
    });

    // Database connections
    this.databaseConnections = new promClient.Gauge({
      name: 'pixelcyberzone_database_connections',
      help: 'Number of database connections',
      labelNames: ['state']
    });

    // Cache hit ratio
    this.cacheHitRatio = new promClient.Gauge({
      name: 'pixelcyberzone_cache_hit_ratio',
      help: 'Cache hit ratio percentage'
    });

    // Set up alert thresholds
    this.setupAlertThresholds();

    // Start system metrics collection
    this.startSystemMetricsCollection();

    console.log('✅ Performance monitoring initialized');
  }

  // Express middleware for request tracking
  static requestTrackingMiddleware() {
    return (req: Request, res: Response, next: NextFunction) => {
      const startTime = performance.now();
      const startTimestamp = Date.now();

      // Increment active connections
      this.activeConnections.inc();

      // Override res.end to capture metrics
      const originalEnd = res.end.bind(res);
      res.end = function(...args: any[]) {
        const endTime = performance.now();
        const responseTime = endTime - startTime;
        const duration = responseTime / 1000; // Convert to seconds

        // Record metrics
        const metrics: RequestMetrics = {
          method: req.method,
          route: req.route?.path || req.path,
          statusCode: res.statusCode,
          responseTime,
          timestamp: new Date(startTimestamp),
          userAgent: req.get('User-Agent'),
          ip: req.ip || req.connection.remoteAddress
        };

        // Store metrics
        MonitoringService.recordRequestMetrics(metrics);

        // Update Prometheus metrics
        MonitoringService.httpRequestDuration
          .labels(req.method, metrics.route, res.statusCode.toString())
          .observe(duration);

        MonitoringService.httpRequestsTotal
          .labels(req.method, metrics.route, res.statusCode.toString())
          .inc();

        // Decrement active connections
        MonitoringService.activeConnections.dec();

        // Check for performance alerts
        MonitoringService.checkPerformanceAlerts(metrics);

        return originalEnd.apply(this, args);
      };

      next();
    };
  }

  // Record request metrics
  private static recordRequestMetrics(metrics: RequestMetrics): void {
    this.requestMetrics.push(metrics);
    
    // Keep only last 1000 requests to prevent memory leaks
    if (this.requestMetrics.length > 1000) {
      this.requestMetrics = this.requestMetrics.slice(-1000);
    }
  }

  // Start system metrics collection
  private static startSystemMetricsCollection(): void {
    setInterval(() => {
      this.collectSystemMetrics();
    }, 10000); // Collect every 10 seconds
  }

  // Collect system metrics
  private static async collectSystemMetrics(): Promise<void> {
    try {
      const memUsage = process.memoryUsage();
      const cpuUsage = os.loadavg();
      const eventLoopDelay = await this.measureEventLoopDelay();

      const metrics: SystemMetrics = {
        cpuUsage,
        memoryUsage: memUsage,
        eventLoopDelay,
        uptime: process.uptime(),
        timestamp: new Date()
      };

      this.systemMetricsHistory.push(metrics);

      // Keep only last 100 entries
      if (this.systemMetricsHistory.length > 100) {
        this.systemMetricsHistory = this.systemMetricsHistory.slice(-100);
      }

      // Update Prometheus metrics
      this.systemMemoryUsage.labels('heap_used').set(memUsage.heapUsed);
      this.systemMemoryUsage.labels('heap_total').set(memUsage.heapTotal);
      this.systemMemoryUsage.labels('external').set(memUsage.external);
      this.systemMemoryUsage.labels('rss').set(memUsage.rss);

      cpuUsage.forEach((load, index) => {
        this.systemCpuUsage.labels(index.toString()).set(load);
      });

      this.eventLoopDelay.set(eventLoopDelay);

    } catch (error) {
      console.error('System metrics collection error:', error);
    }
  }

  // Measure event loop delay
  private static async measureEventLoopDelay(): Promise<number> {
    return new Promise((resolve) => {
      const start = process.hrtime.bigint();
      setImmediate(() => {
        const delta = process.hrtime.bigint() - start;
        resolve(Number(delta) / 1000000); // Convert to milliseconds
      });
    });
  }

  // Setup alert thresholds
  private static setupAlertThresholds(): void {
    this.alertThresholds = {
      responseTime: {
        warning: 1000, // 1 second
        critical: 5000 // 5 seconds
      },
      errorRate: {
        warning: 0.05, // 5%
        critical: 0.10 // 10%
      },
      memoryUsage: {
        warning: 0.80, // 80%
        critical: 0.95 // 95%
      },
      eventLoopDelay: {
        warning: 100, // 100ms
        critical: 500 // 500ms
      }
    };
  }

  // Check for performance alerts
  private static checkPerformanceAlerts(metrics: RequestMetrics): void {
    // Response time alerts
    if (metrics.responseTime > this.alertThresholds.responseTime.critical) {
      this.triggerAlert('critical', 'response_time', {
        message: `Critical response time: ${metrics.responseTime}ms`,
        route: metrics.route,
        method: metrics.method
      });
    } else if (metrics.responseTime > this.alertThresholds.responseTime.warning) {
      this.triggerAlert('warning', 'response_time', {
        message: `Slow response time: ${metrics.responseTime}ms`,
        route: metrics.route,
        method: metrics.method
      });
    }

    // Error rate alerts
    if (metrics.statusCode >= 500) {
      this.triggerAlert('critical', 'error_rate', {
        message: `Server error: ${metrics.statusCode}`,
        route: metrics.route,
        method: metrics.method
      });
    } else if (metrics.statusCode >= 400) {
      this.triggerAlert('warning', 'error_rate', {
        message: `Client error: ${metrics.statusCode}`,
        route: metrics.route,
        method: metrics.method
      });
    }
  }

  // Trigger alert
  private static triggerAlert(level: 'warning' | 'critical', type: string, data: any): void {
    const alert = {
      level,
      type,
      data,
      timestamp: new Date().toISOString(),
      service: 'pixelcyberzone-backend'
    };

    console.warn(`🚨 ${level.toUpperCase()} ALERT [${type}]:`, JSON.stringify(alert, null, 2));

    // In a real implementation, send to alerting system (PagerDuty, Slack, etc.)
    // this.sendToAlertingSystem(alert);
  }

  // Get performance dashboard data
  static getPerformanceDashboard(): any {
    const now = Date.now();
    const oneHourAgo = now - (60 * 60 * 1000);

    // Filter recent metrics
    const recentRequests = this.requestMetrics.filter(m => 
      m.timestamp.getTime() > oneHourAgo
    );

    const recentSystemMetrics = this.systemMetricsHistory.filter(m => 
      m.timestamp.getTime() > oneHourAgo
    );

    // Calculate statistics
    const totalRequests = recentRequests.length;
    const errorRequests = recentRequests.filter(m => m.statusCode >= 400).length;
    const avgResponseTime = totalRequests > 0 
      ? recentRequests.reduce((sum, m) => sum + m.responseTime, 0) / totalRequests 
      : 0;

    const errorRate = totalRequests > 0 ? errorRequests / totalRequests : 0;

    // System stats
    const latestSystemMetrics = recentSystemMetrics[recentSystemMetrics.length - 1];
    const memoryUsagePercent = latestSystemMetrics 
      ? (latestSystemMetrics.memoryUsage.heapUsed / latestSystemMetrics.memoryUsage.heapTotal) * 100
      : 0;

    return {
      overview: {
        totalRequests,
        errorRequests,
        errorRate: Math.round(errorRate * 10000) / 100, // Percentage with 2 decimals
        avgResponseTime: Math.round(avgResponseTime * 100) / 100,
        uptime: process.uptime()
      },
      system: {
        memoryUsagePercent: Math.round(memoryUsagePercent * 100) / 100,
        cpuLoad: latestSystemMetrics?.cpuUsage || [0, 0, 0],
        eventLoopDelay: latestSystemMetrics?.eventLoopDelay || 0
      },
      trends: {
        requestsOverTime: this.getRequestTrends(recentRequests),
        responseTimeOverTime: this.getResponseTimeTrends(recentRequests),
        errorRateOverTime: this.getErrorRateTrends(recentRequests)
      },
      alerts: this.getRecentAlerts(),
      topEndpoints: this.getTopEndpoints(recentRequests),
      slowestEndpoints: this.getSlowestEndpoints(recentRequests)
    };
  }

  // Get request trends (requests per minute)
  private static getRequestTrends(requests: RequestMetrics[]): any[] {
    const trends: any[] = [];
    const now = Date.now();
    
    for (let i = 59; i >= 0; i--) {
      const minuteStart = now - (i * 60 * 1000);
      const minuteEnd = minuteStart + 60 * 1000;
      
      const requestsInMinute = requests.filter(r => 
        r.timestamp.getTime() >= minuteStart && r.timestamp.getTime() < minuteEnd
      ).length;
      
      trends.push({
        timestamp: new Date(minuteStart).toISOString(),
        value: requestsInMinute
      });
    }
    
    return trends;
  }

  // Get response time trends
  private static getResponseTimeTrends(requests: RequestMetrics[]): any[] {
    const trends: any[] = [];
    const now = Date.now();
    
    for (let i = 59; i >= 0; i--) {
      const minuteStart = now - (i * 60 * 1000);
      const minuteEnd = minuteStart + 60 * 1000;
      
      const requestsInMinute = requests.filter(r => 
        r.timestamp.getTime() >= minuteStart && r.timestamp.getTime() < minuteEnd
      );
      
      const avgResponseTime = requestsInMinute.length > 0
        ? requestsInMinute.reduce((sum, r) => sum + r.responseTime, 0) / requestsInMinute.length
        : 0;
      
      trends.push({
        timestamp: new Date(minuteStart).toISOString(),
        value: Math.round(avgResponseTime * 100) / 100
      });
    }
    
    return trends;
  }

  // Get error rate trends
  private static getErrorRateTrends(requests: RequestMetrics[]): any[] {
    const trends: any[] = [];
    const now = Date.now();
    
    for (let i = 59; i >= 0; i--) {
      const minuteStart = now - (i * 60 * 1000);
      const minuteEnd = minuteStart + 60 * 1000;
      
      const requestsInMinute = requests.filter(r => 
        r.timestamp.getTime() >= minuteStart && r.timestamp.getTime() < minuteEnd
      );
      
      const errorRequests = requestsInMinute.filter(r => r.statusCode >= 400).length;
      const errorRate = requestsInMinute.length > 0 
        ? (errorRequests / requestsInMinute.length) * 100 
        : 0;
      
      trends.push({
        timestamp: new Date(minuteStart).toISOString(),
        value: Math.round(errorRate * 100) / 100
      });
    }
    
    return trends;
  }

  // Get top endpoints by request count
  private static getTopEndpoints(requests: RequestMetrics[]): any[] {
    const endpointCounts: Map<string, number> = new Map();
    
    requests.forEach(r => {
      const key = `${r.method} ${r.route}`;
      endpointCounts.set(key, (endpointCounts.get(key) || 0) + 1);
    });
    
    return Array.from(endpointCounts.entries())
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([endpoint, count]) => ({ endpoint, count }));
  }

  // Get slowest endpoints
  private static getSlowestEndpoints(requests: RequestMetrics[]): any[] {
    const endpointTimes: Map<string, number[]> = new Map();
    
    requests.forEach(r => {
      const key = `${r.method} ${r.route}`;
      if (!endpointTimes.has(key)) {
        endpointTimes.set(key, []);
      }
      endpointTimes.get(key)!.push(r.responseTime);
    });
    
    const avgTimes = Array.from(endpointTimes.entries())
      .map(([endpoint, times]) => ({
        endpoint,
        avgResponseTime: Math.round((times.reduce((a, b) => a + b, 0) / times.length) * 100) / 100,
        requestCount: times.length
      }))
      .sort((a, b) => b.avgResponseTime - a.avgResponseTime)
      .slice(0, 10);
    
    return avgTimes;
  }

  // Get recent alerts (mock implementation)
  private static getRecentAlerts(): any[] {
    // In a real implementation, this would fetch from an alerts database
    return [
      {
        id: '1',
        level: 'warning',
        type: 'response_time',
        message: 'Average response time increased',
        timestamp: new Date(Date.now() - 300000).toISOString(), // 5 minutes ago
        resolved: false
      }
    ];
  }

  // Business metrics tracking
  static async recordBusinessMetrics(metrics: Partial<BusinessMetrics>): Promise<void> {
    const fullMetrics: BusinessMetrics = {
      activeUsers: metrics.activeUsers || 0,
      gamingSessions: metrics.gamingSessions || 0,
      revenue: metrics.revenue || 0,
      caseOpenings: metrics.caseOpenings || 0,
      timestamp: new Date()
    };

    this.businessMetricsHistory.push(fullMetrics);

    // Keep only last 100 entries
    if (this.businessMetricsHistory.length > 100) {
      this.businessMetricsHistory = this.businessMetricsHistory.slice(-100);
    }

    // Update Prometheus metrics
    this.businessMetrics.labels('active_users').set(fullMetrics.activeUsers);
    this.businessMetrics.labels('gaming_sessions').set(fullMetrics.gamingSessions);
    this.businessMetrics.labels('revenue').set(fullMetrics.revenue);
    this.businessMetrics.labels('case_openings').set(fullMetrics.caseOpenings);
  }

  // Update database connection metrics
  static updateDatabaseMetrics(activeConnections: number, totalConnections: number): void {
    this.databaseConnections.labels('active').set(activeConnections);
    this.databaseConnections.labels('total').set(totalConnections);
  }

  // Update cache metrics
  static updateCacheMetrics(hits: number, misses: number): void {
    const total = hits + misses;
    const hitRatio = total > 0 ? (hits / total) * 100 : 0;
    this.cacheHitRatio.set(hitRatio);
  }

  // Get Prometheus metrics
  static async getPrometheusMetrics(): Promise<string> {
    return promClient.register.metrics();
  }

  // Performance analysis
  static analyzePerformance(): any {
    const recentRequests = this.requestMetrics.slice(-100); // Last 100 requests
    
    if (recentRequests.length === 0) {
      return { message: 'No request data available' };
    }

    const analysis = {
      requestAnalysis: {
        totalRequests: recentRequests.length,
        avgResponseTime: recentRequests.reduce((sum, r) => sum + r.responseTime, 0) / recentRequests.length,
        maxResponseTime: Math.max(...recentRequests.map(r => r.responseTime)),
        minResponseTime: Math.min(...recentRequests.map(r => r.responseTime)),
        errorRate: recentRequests.filter(r => r.statusCode >= 400).length / recentRequests.length * 100
      },
      systemAnalysis: this.analyzeSystemPerformance(),
      recommendations: this.generatePerformanceRecommendations(recentRequests)
    };

    return analysis;
  }

  // Analyze system performance
  private static analyzeSystemPerformance(): any {
    const latestMetrics = this.systemMetricsHistory[this.systemMetricsHistory.length - 1];
    
    if (!latestMetrics) {
      return { message: 'No system metrics available' };
    }

    const memoryUsagePercent = (latestMetrics.memoryUsage.heapUsed / latestMetrics.memoryUsage.heapTotal) * 100;
    
    return {
      memoryUsage: {
        percentage: Math.round(memoryUsagePercent * 100) / 100,
        heapUsed: Math.round(latestMetrics.memoryUsage.heapUsed / 1024 / 1024 * 100) / 100, // MB
        heapTotal: Math.round(latestMetrics.memoryUsage.heapTotal / 1024 / 1024 * 100) / 100 // MB
      },
      cpuLoad: {
        oneMinute: latestMetrics.cpuUsage[0],
        fiveMinutes: latestMetrics.cpuUsage[1],
        fifteenMinutes: latestMetrics.cpuUsage[2]
      },
      eventLoopDelay: latestMetrics.eventLoopDelay,
      uptime: latestMetrics.uptime
    };
  }

  // Generate performance recommendations
  private static generatePerformanceRecommendations(requests: RequestMetrics[]): string[] {
    const recommendations: string[] = [];
    
    const avgResponseTime = requests.reduce((sum, r) => sum + r.responseTime, 0) / requests.length;
    const errorRate = requests.filter(r => r.statusCode >= 400).length / requests.length;
    
    if (avgResponseTime > 1000) {
      recommendations.push('Consider implementing response caching for frequently accessed endpoints');
      recommendations.push('Review database query performance and add indexes where needed');
    }
    
    if (errorRate > 0.05) {
      recommendations.push('Investigate high error rate and implement better error handling');
      recommendations.push('Add input validation and sanitization to prevent client errors');
    }
    
    const latestSystemMetrics = this.systemMetricsHistory[this.systemMetricsHistory.length - 1];
    if (latestSystemMetrics) {
      const memoryUsagePercent = (latestSystemMetrics.memoryUsage.heapUsed / latestSystemMetrics.memoryUsage.heapTotal) * 100;
      
      if (memoryUsagePercent > 80) {
        recommendations.push('Memory usage is high, consider implementing memory optimization strategies');
        recommendations.push('Review for memory leaks and optimize data structures');
      }
      
      if (latestSystemMetrics.eventLoopDelay > 100) {
        recommendations.push('Event loop delay is high, consider moving CPU-intensive tasks to worker threads');
        recommendations.push('Implement async processing for heavy operations');
      }
    }
    
    return recommendations;
  }

  // Custom metric tracking
  static trackCustomMetric(name: string, value: number, labels: Record<string, string> = {}): void {
    try {
      // Create or get existing gauge
      let gauge = promClient.register.getSingleMetric(`pixelcyberzone_custom_${name}`) as promClient.Gauge<string>;
      
      if (!gauge) {
        gauge = new promClient.Gauge({
          name: `pixelcyberzone_custom_${name}`,
          help: `Custom metric: ${name}`,
          labelNames: Object.keys(labels)
        });
      }
      
      if (Object.keys(labels).length > 0) {
        gauge.labels(labels).set(value);
      } else {
        gauge.set(value);
      }
    } catch (error) {
      console.error('Error tracking custom metric:', error);
    }
  }

  // Export metrics for external monitoring systems
  static exportMetricsToExternal(): any {
    return {
      requests: this.requestMetrics.slice(-1000),
      systemMetrics: this.systemMetricsHistory.slice(-100),
      businessMetrics: this.businessMetricsHistory.slice(-100),
      prometheus: promClient.register.getMetricsAsJSON()
    };
  }
}

export default MonitoringService;
