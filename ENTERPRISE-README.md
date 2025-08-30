# PixelCyberZone Enterprise Architecture

🚀 **Complete enterprise-grade full-stack web application with microservices architecture, real-time features, and comprehensive monitoring.**

## 🏗️ Architecture Overview

This application has been transformed from a monolithic structure to a full enterprise-grade architecture featuring:

### ✅ Implemented Features

- **🔄 Redis Caching Layer** - High-performance caching with fallback to memory cache
- **📊 Database Indexing Optimization** - Comprehensive MongoDB indexing for optimal query performance  
- **⚖️ Load Balancing Architecture** - NGINX load balancer with health checks and SSL termination
- **🌐 CDN Integration** - Asset optimization, versioning, and delivery optimization
- **📈 Performance Monitoring** - Prometheus metrics, custom dashboards, and alerting
- **🚪 API Gateway** - Centralized routing, authentication, rate limiting, and service discovery
- **📬 Message Queuing System** - BullMQ with Redis for async task processing
- **🔌 Real-time WebSocket Features** - Live chat, notifications, gaming session updates
- **🎯 Event-driven Architecture** - Comprehensive event bus with saga pattern support
- **🐳 Microservices Architecture** - Split into dedicated services for scalability
- **📊 Monitoring & Logging** - ELK stack for centralized logging and observability

## 🏛️ System Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Load Balancer  │    │   API Gateway   │
│   (React)       │◄───┤   (NGINX)        │◄───┤   (Express)     │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                                                          │
                       ┌──────────────────────────────────┼──────────────────────────────────┐
                       │                                  │                                  │
                ┌──────▼──────┐  ┌──────────────┐  ┌──────▼──────┐  ┌──────────────┐  ┌──────▼──────┐
                │ User Service│  │ Game Service │  │Book Service │  │Payment Service│  │Notify Service│
                │   :3001     │  │    :3002     │  │    :3003    │  │     :3004     │  │    :3005     │
                └─────────────┘  └──────────────┘  └─────────────┘  └───────────────┘  └─────────────┘
                       │                │                │                │                │
                       └────────────────┼────────────────┼────────────────┼────────────────┘
                                        │                │                │
                ┌───────────────────────┼────────────────┼────────────────┼───────────────────────┐
                │                       │                │                │                       │
         ┌──────▼──────┐         ┌──────▼──────┐  ┌──────▼──────┐  ┌──────▼──────┐         ┌──────▼──────┐
         │  MongoDB    │         │   Redis     │  │ Event Bus   │  │ Message     │         │ Monitoring  │
         │ (Database)  │         │ (Cache)     │  │ (Events)    │  │ Queues      │         │ (ELK+Grafana)│
         └─────────────┘         └─────────────┘  └─────────────┘  └─────────────┘         └─────────────┘
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- Docker & Docker Compose
- MongoDB (or use Docker)
- Redis (or use Docker)

### Installation

1. **Clone and setup:**
```bash
cd Desktop/pixelcyberzonefinal
npm install
cd backend && npm install
```

2. **Configure environment:**
```bash
cp .env.enterprise .env
# Edit .env with your specific configuration
```

3. **Install new dependencies:**
```bash
cd backend
npm install
```

4. **Deploy with Docker (Recommended):**
```bash
# Make deploy script executable
chmod +x scripts/deploy.sh

# Deploy complete infrastructure
./scripts/deploy.sh deploy

# Or deploy to production
./scripts/deploy.sh production
```

5. **Or run manually:**
```bash
# Start databases
docker-compose up -d mongodb redis

# Start backend
cd backend
npm run dev

# Start frontend  
npm run dev
```

## 🏗️ Services Architecture

### Core Services

| Service | Port | Description | Features |
|---------|------|-------------|----------|
| **API Gateway** | 8080 | Central entry point | Routing, auth, rate limiting, service discovery |
| **User Service** | 3001 | User management | Authentication, authorization, user profiles |
| **Game Service** | 3002 | Gaming features | Game sessions, case openings, achievements |
| **Booking Service** | 3003 | Reservations | Station booking, scheduling, availability |
| **Payment Service** | 3004 | Financial transactions | Payments, refunds, promo codes |
| **Notification Service** | 3005 | Communications | Emails, push notifications, alerts |

### Infrastructure Services

| Service | Port | Description |
|---------|------|-------------|
| **NGINX** | 80/443 | Load balancer & reverse proxy |
| **MongoDB** | 27017 | Primary database |
| **Redis** | 6379 | Cache & message broker |
| **Elasticsearch** | 9200 | Log storage & search |
| **Kibana** | 5601 | Log visualization |
| **Prometheus** | 9090 | Metrics collection |
| **Grafana** | 3000 | Monitoring dashboards |

## 🔧 Configuration

### Environment Variables

Key configuration in `.env`:

```bash
# Core services
NODE_ENV=production
MONGODB_URI=mongodb://localhost:27017/pixelcyberzone
REDIS_HOST=localhost
JWT_SECRET=your-secret-key

# Microservices
USER_SERVICE_PORT=3001
GAME_SERVICE_PORT=3002
BOOKING_SERVICE_PORT=3003

# External services
SMTP_HOST=smtp.gmail.com
STRIPE_SECRET_KEY=sk_test_...
CDN_BASE_URL=https://cdn.pixelcyberzone.com
```

### Feature Flags

Enable/disable features:

```bash
ENABLE_WEBSOCKETS=true
ENABLE_CACHING=true
ENABLE_QUEUE_PROCESSING=true
ENABLE_EVENT_SYSTEM=true
ENABLE_PERFORMANCE_MONITORING=true
```

## 📊 Monitoring & Observability

### Health Checks

- **Basic Health**: `GET /health`
- **Detailed Health**: `GET /health/detailed` 
- **Readiness**: `GET /ready`
- **Liveness**: `GET /live`

### Metrics Endpoints

- **Prometheus**: `GET /prometheus`
- **Dashboard**: `GET /dashboard`
- **Events**: `GET /events/stats`
- **Queues**: `GET /queues/stats`

### Monitoring Stack

1. **Prometheus** - Metrics collection
2. **Grafana** - Visualization dashboards
3. **ELK Stack** - Centralized logging
4. **Custom Metrics** - Business and performance metrics

## 🔄 Real-time Features

### WebSocket Events

```typescript
// Client connection
const socket = io('ws://localhost:3001', {
  auth: { token: authToken }
});

// Chat functionality
socket.emit('chat:join-room', 'general');
socket.emit('chat:message', { roomId: 'general', message: 'Hello!' });

// Gaming updates
socket.on('gaming:session-update', (data) => {
  console.log('Session update:', data);
});

// Live notifications
socket.on('notification:new', (notification) => {
  showNotification(notification);
});
```

### Event-driven Actions

```typescript
// Emit events from your application
await EventService.emitEvent({
  type: 'user.registered',
  source: 'user-service',
  userId: user.id,
  data: {
    action: 'registered',
    details: { email: user.email, name: user.name }
  }
});
```

## 📬 Message Queues

### Queue Types

- **Email Queue** - Transactional emails
- **Notification Queue** - Push notifications  
- **Audit Queue** - Audit logging
- **Case Opening Queue** - Game rewards processing
- **Booking Queue** - Reservation processing

### Usage Example

```typescript
// Add email to queue
await QueueService.addEmailJob({
  to: 'user@example.com',
  subject: 'Welcome!',
  template: 'welcome',
  data: { name: 'John' }
});

// Add notification to queue
await QueueService.addNotificationJob({
  userId: '123',
  type: 'success',
  title: 'Booking Confirmed',
  message: 'Your reservation is confirmed'
});
```

## 🚀 Deployment

### Development

```bash
# Quick start
./scripts/deploy.sh deploy

# Check status
./scripts/deploy.sh status

# View logs
./scripts/deploy.sh logs user-service
```

### Production

```bash
# Production deployment
./scripts/deploy.sh production

# Scale services
./scripts/deploy.sh scale user-service 5
./scripts/deploy.sh scale game-service 3

# Monitor
./scripts/deploy.sh status
```

### Docker Commands

```bash
# Start all services
docker-compose up -d

# Scale specific service  
docker-compose up -d --scale user-service=3

# View logs
docker-compose logs -f user-service

# Stop services
docker-compose down
```

## 🔐 Security Features

### Authentication & Authorization
- JWT-based authentication
- Role-based access control (RBAC)
- Session management with Redis
- Password hashing with bcrypt

### Security Middleware
- Helmet.js for security headers
- CORS configuration
- Rate limiting (Redis-backed)
- Input validation with Joi

### Network Security
- NGINX SSL termination
- Internal service communication
- IP whitelisting for admin routes
- DDoS protection

## 📈 Performance Optimizations

### Caching Strategy
- **L1 Cache**: Memory cache (node-cache)
- **L2 Cache**: Redis distributed cache
- **CDN Cache**: Static asset caching
- **Database Query Cache**: Mongoose query caching

### Database Optimizations
- Comprehensive indexing strategy
- Query optimization
- Connection pooling
- Read/write splitting capability

### Load Balancing
- NGINX upstream configuration
- Health-based routing
- Sticky sessions for WebSockets
- Auto-scaling support

## 🔍 Troubleshooting

### Common Issues

1. **Redis Connection Failed**
   ```bash
   # Check Redis status
   docker-compose ps redis
   
   # View Redis logs
   docker-compose logs redis
   ```

2. **Database Connection Issues**
   ```bash
   # Check MongoDB status
   docker-compose ps mongodb
   
   # Test connection
   docker exec -it pixelcyberzone-mongodb mongosh
   ```

3. **Service Health Issues**
   ```bash
   # Check all service health
   ./scripts/deploy.sh status
   
   # Check specific service
   curl http://localhost:3001/health/detailed
   ```

### Log Analysis

```bash
# View all logs
docker-compose logs -f

# Service-specific logs
docker-compose logs -f user-service

# Error logs only
docker-compose logs -f | grep ERROR
```

## 📊 Monitoring Dashboards

### Access URLs

- **Grafana**: http://localhost:3000 (admin/admin)
- **Kibana**: http://localhost:5601  
- **Prometheus**: http://localhost:9090
- **Queue Dashboard**: http://localhost:3010

### Key Metrics

- Request latency and throughput
- Error rates and status codes
- Memory and CPU usage
- Database query performance
- Cache hit/miss ratios
- Queue processing stats
- WebSocket connection counts

## 🔄 Event System

### Event Types

- `user.*` - User lifecycle events
- `booking.*` - Reservation events  
- `game.*` - Gaming session events
- `payment.*` - Financial transaction events
- `system.*` - System health and status events

### Event Handlers

Events automatically trigger:
- Email notifications
- Push notifications
- Audit logging
- Cache invalidation
- Real-time updates
- Business metrics tracking

## 🛠️ Development Guide

### Adding New Features

1. **Create service endpoint**
2. **Add caching if needed**
3. **Emit relevant events**
4. **Add monitoring metrics**
5. **Update health checks**
6. **Add tests**

### Service Communication

Services communicate via:
- **HTTP**: Request/response through API Gateway
- **Events**: Async event-driven communication
- **Queues**: Background job processing
- **WebSockets**: Real-time updates

## 📝 API Documentation

### Authentication Endpoints

```
POST /api/auth/login          # User login
POST /api/auth/register       # User registration  
POST /api/auth/logout         # User logout
POST /api/auth/refresh        # Refresh token
POST /api/auth/forgot-password # Password reset
```

### User Management

```
GET  /api/users/profile       # Get user profile
PUT  /api/users/profile       # Update profile
GET  /api/users/stats         # User statistics
```

### Gaming Features

```
GET  /api/games/sessions      # Active sessions
POST /api/games/start-session # Start gaming session
POST /api/cases/open          # Open game case
GET  /api/cases/history       # Case opening history
```

### Monitoring Endpoints

```
GET  /health                  # Basic health check
GET  /health/detailed         # Detailed health with dependencies
GET  /metrics                 # Prometheus metrics
GET  /dashboard              # Performance dashboard
GET  /events/stats           # Event system statistics
GET  /queues/stats           # Message queue statistics
```

## 🔧 Maintenance

### Database Maintenance

```bash
# Optimize indexes
npm run db:optimize

# Backup database
./scripts/backup.sh

# Analyze query performance
curl http://localhost:3001/metrics | grep mongodb
```

### Cache Management

```bash
# Clear all caches
curl -X DELETE http://localhost:3001/api/cache/clear

# Cache statistics
curl http://localhost:3001/api/cache/stats
```

### Queue Management

```bash
# Queue statistics
curl http://localhost:3001/queues/stats

# Retry failed jobs
curl -X POST http://localhost:3001/api/queues/retry/email

# Clear queue
curl -X DELETE http://localhost:3001/api/queues/clear/notification
```

## 🚨 Alerting

### Alert Types

- **Performance**: Response time > 5s
- **Errors**: Error rate > 10%
- **Resource**: Memory usage > 80%
- **Health**: Service health check failures

### Alert Channels

- Console logging
- WebSocket broadcasts to admins
- Email notifications (configurable)
- Slack/Discord webhooks (configurable)

## 📊 Business Metrics

The system tracks:

- User registrations and activity
- Gaming session duration
- Case opening statistics
- Revenue and payment metrics
- System performance metrics
- Error rates and availability

## 🔮 Future Enhancements

Potential improvements:

- Kubernetes deployment
- Service mesh (Istio)
- Distributed tracing (Jaeger)
- Advanced analytics (Apache Kafka)
- Machine learning integration
- Advanced security (OAuth2, SSO)

## 📞 Support

For issues or questions:

1. Check the logs: `./scripts/deploy.sh logs`
2. Verify service health: `./scripts/deploy.sh status`
3. Review monitoring dashboards
4. Check the troubleshooting section above

---

🎮 **PixelCyberZone** - Enterprise-grade internet cafe management system
Built with ❤️ using modern technologies and best practices.
