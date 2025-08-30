#!/bin/bash

# PixelCyberZone Enterprise Deployment Script
# This script sets up the complete microservices architecture

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_NAME="pixelcyberzone"
COMPOSE_PROJECT_NAME="pixelcyberzone"
ENVIRONMENT=${ENVIRONMENT:-production}
SCALE_USER_SERVICE=${SCALE_USER_SERVICE:-3}
SCALE_GAME_SERVICE=${SCALE_GAME_SERVICE:-2}
SCALE_BOOKING_SERVICE=${SCALE_BOOKING_SERVICE:-2}

# Functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check prerequisites
check_prerequisites() {
    log_info "Checking prerequisites..."
    
    # Check Docker
    if ! command -v docker &> /dev/null; then
        log_error "Docker is not installed"
        exit 1
    fi
    
    # Check Docker Compose
    if ! command -v docker-compose &> /dev/null; then
        log_error "Docker Compose is not installed"
        exit 1
    fi
    
    # Check if Docker daemon is running
    if ! docker info &> /dev/null; then
        log_error "Docker daemon is not running"
        exit 1
    fi
    
    log_success "Prerequisites check passed"
}

# Setup environment variables
setup_environment() {
    log_info "Setting up environment variables..."
    
    if [ ! -f .env ]; then
        log_warning ".env file not found, creating from template..."
        cp .env.example .env
    fi
    
    # Load environment variables
    if [ -f .env ]; then
        export $(cat .env | grep -v '#' | awk '/=/ {print $1}')
    fi
    
    # Set default values if not provided
    export MONGODB_ROOT_PASSWORD=${MONGODB_ROOT_PASSWORD:-strongpassword}
    export REDIS_PASSWORD=${REDIS_PASSWORD:-redispassword}
    export JWT_SECRET=${JWT_SECRET:-$(openssl rand -base64 32)}
    export GRAFANA_ADMIN_PASSWORD=${GRAFANA_ADMIN_PASSWORD:-admin}
    
    log_success "Environment variables configured"
}

# Build all services
build_services() {
    log_info "Building all services..."
    
    # Build frontend
    log_info "Building frontend..."
    npm run build
    
    # Build Docker images
    log_info "Building Docker images..."
    docker-compose build --parallel
    
    log_success "All services built successfully"
}

# Setup databases
setup_databases() {
    log_info "Setting up databases..."
    
    # Start MongoDB and Redis first
    docker-compose up -d mongodb redis
    
    # Wait for databases to be ready
    log_info "Waiting for databases to be ready..."
    sleep 30
    
    # Initialize MongoDB replica set
    log_info "Initializing MongoDB replica set..."
    docker exec pixelcyberzone-mongodb mongosh --eval "rs.initiate()"
    
    # Run database migrations and indexing
    log_info "Running database optimizations..."
    npm run db:optimize
    
    log_success "Databases setup completed"
}

# Deploy monitoring stack
deploy_monitoring() {
    log_info "Deploying monitoring stack..."
    
    # Start monitoring services
    docker-compose up -d elasticsearch logstash kibana prometheus grafana node-exporter
    
    # Wait for services to be ready
    log_info "Waiting for monitoring services to be ready..."
    sleep 45
    
    # Setup Grafana dashboards
    log_info "Configuring Grafana dashboards..."
    curl -X POST http://admin:${GRAFANA_ADMIN_PASSWORD}@localhost:3000/api/dashboards/db \
         -H "Content-Type: application/json" \
         -d @monitoring/grafana/dashboards/pixelcyberzone-dashboard.json || true
    
    log_success "Monitoring stack deployed"
}

# Deploy application services
deploy_application() {
    log_info "Deploying application services..."
    
    # Start all application services
    docker-compose up -d \
        --scale user-service=$SCALE_USER_SERVICE \
        --scale game-service=$SCALE_GAME_SERVICE \
        --scale booking-service=$SCALE_BOOKING_SERVICE
    
    # Wait for services to be ready
    log_info "Waiting for application services to be ready..."
    sleep 30
    
    # Run health checks
    check_services_health
    
    log_success "Application services deployed"
}

# Check services health
check_services_health() {
    log_info "Checking services health..."
    
    services=("user-service:3001" "game-service:3002" "booking-service:3003" "payment-service:3004" "notification-service:3005" "api-gateway:8080")
    
    for service in "${services[@]}"; do
        service_name=$(echo $service | cut -d':' -f1)
        port=$(echo $service | cut -d':' -f2)
        
        log_info "Checking $service_name health..."
        
        max_attempts=10
        attempt=1
        
        while [ $attempt -le $max_attempts ]; do
            if curl -f -s http://localhost:$port/health > /dev/null; then
                log_success "$service_name is healthy"
                break
            else
                if [ $attempt -eq $max_attempts ]; then
                    log_error "$service_name health check failed after $max_attempts attempts"
                    exit 1
                fi
                log_warning "$service_name not ready, attempt $attempt/$max_attempts"
                sleep 5
                ((attempt++))
            fi
        done
    done
    
    log_success "All services are healthy"
}

# Setup SSL certificates (for production)
setup_ssl() {
    log_info "Setting up SSL certificates..."
    
    if [ "$ENVIRONMENT" = "production" ]; then
        # Create SSL directory
        mkdir -p nginx/ssl
        
        # Generate self-signed certificates (replace with real certificates in production)
        openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
            -keyout nginx/ssl/pixelcyberzone.key \
            -out nginx/ssl/pixelcyberzone.crt \
            -subj "/C=US/ST=State/L=City/O=PixelCyberZone/CN=pixelcyberzone.com"
        
        log_success "SSL certificates configured"
    else
        log_info "Skipping SSL setup for development environment"
    fi
}

# Setup CDN and asset optimization
setup_cdn() {
    log_info "Setting up CDN and asset optimization..."
    
    # Create assets directory
    mkdir -p public/assets/optimized
    
    # Run asset optimization
    npm run assets:optimize
    
    log_success "CDN and assets configured"
}

# Deploy to production
deploy_production() {
    log_info "Deploying to production environment..."
    
    # Build and deploy with production configuration
    docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d \
        --scale user-service=$SCALE_USER_SERVICE \
        --scale game-service=$SCALE_GAME_SERVICE \
        --scale booking-service=$SCALE_BOOKING_SERVICE
    
    log_success "Production deployment completed"
}

# Rollback function
rollback() {
    log_warning "Rolling back deployment..."
    
    # Stop all services
    docker-compose down
    
    # Restore from backup if available
    if [ -f "backup/docker-compose.yml.backup" ]; then
        cp backup/docker-compose.yml.backup docker-compose.yml
        log_info "Restored previous configuration"
    fi
    
    log_success "Rollback completed"
}

# Backup configuration
backup_config() {
    log_info "Backing up configuration..."
    
    mkdir -p backup
    cp docker-compose.yml backup/docker-compose.yml.backup
    cp -r nginx backup/nginx.backup
    
    # Backup database
    docker exec pixelcyberzone-mongodb mongodump --out /tmp/backup
    docker cp pixelcyberzone-mongodb:/tmp/backup ./backup/mongodb-$(date +%Y%m%d-%H%M%S)
    
    log_success "Configuration backed up"
}

# Cleanup function
cleanup() {
    log_info "Cleaning up..."
    
    # Remove unused Docker images
    docker image prune -f
    
    # Remove unused volumes
    docker volume prune -f
    
    # Remove unused networks
    docker network prune -f
    
    log_success "Cleanup completed"
}

# Show deployment status
show_status() {
    log_info "Deployment Status:"
    echo "===================="
    
    # Show running containers
    docker-compose ps
    
    echo ""
    log_info "Service URLs:"
    echo "🌐 Frontend: http://localhost"
    echo "🚪 API Gateway: http://localhost:8080"
    echo "👤 User Service: http://localhost:3001"
    echo "🎮 Game Service: http://localhost:3002"
    echo "📅 Booking Service: http://localhost:3003"
    echo "💳 Payment Service: http://localhost:3004"
    echo "🔔 Notification Service: http://localhost:3005"
    echo ""
    echo "📊 Monitoring:"
    echo "📈 Grafana: http://localhost:3000"
    echo "🔍 Kibana: http://localhost:5601"
    echo "📊 Prometheus: http://localhost:9090"
    echo "📋 Queue Dashboard: http://localhost:3010"
    echo ""
    
    # Check service health
    log_info "Health Status:"
    services=("api-gateway:8080" "user-service:3001" "game-service:3002" "booking-service:3003" "payment-service:3004" "notification-service:3005")
    
    for service in "${services[@]}"; do
        service_name=$(echo $service | cut -d':' -f1)
        port=$(echo $service | cut -d':' -f2)
        
        if curl -f -s http://localhost:$port/health > /dev/null; then
            echo -e "${GREEN}✅ ${service_name}${NC}"
        else
            echo -e "${RED}❌ ${service_name}${NC}"
        fi
    done
}

# Main deployment function
main() {
    case "$1" in
        "check")
            check_prerequisites
            ;;
        "build")
            check_prerequisites
            setup_environment
            build_services
            ;;
        "deploy")
            check_prerequisites
            setup_environment
            backup_config
            setup_ssl
            setup_cdn
            setup_databases
            deploy_monitoring
            deploy_application
            show_status
            ;;
        "production")
            ENVIRONMENT=production
            check_prerequisites
            setup_environment
            backup_config
            setup_ssl
            setup_cdn
            setup_databases
            deploy_monitoring
            deploy_production
            show_status
            ;;
        "rollback")
            rollback
            ;;
        "status")
            show_status
            ;;
        "cleanup")
            cleanup
            ;;
        "logs")
            docker-compose logs -f ${2:-}
            ;;
        "scale")
            if [ -z "$2" ] || [ -z "$3" ]; then
                log_error "Usage: $0 scale <service> <count>"
                exit 1
            fi
            docker-compose up -d --scale $2=$3
            ;;
        "stop")
            log_info "Stopping all services..."
            docker-compose down
            log_success "All services stopped"
            ;;
        "restart")
            log_info "Restarting services..."
            docker-compose restart ${2:-}
            log_success "Services restarted"
            ;;
        *)
            echo "PixelCyberZone Enterprise Deployment Script"
            echo ""
            echo "Usage: $0 {check|build|deploy|production|rollback|status|cleanup|logs|scale|stop|restart}"
            echo ""
            echo "Commands:"
            echo "  check       - Check prerequisites"
            echo "  build       - Build all services"
            echo "  deploy      - Deploy to development environment"
            echo "  production  - Deploy to production environment"
            echo "  rollback    - Rollback to previous deployment"
            echo "  status      - Show deployment status"
            echo "  cleanup     - Clean up unused Docker resources"
            echo "  logs [svc]  - Show logs for all services or specific service"
            echo "  scale <svc> <count> - Scale a specific service"
            echo "  stop        - Stop all services"
            echo "  restart [svc] - Restart all services or specific service"
            echo ""
            echo "Examples:"
            echo "  $0 deploy                    # Deploy to development"
            echo "  $0 production               # Deploy to production"
            echo "  $0 scale user-service 5     # Scale user service to 5 instances"
            echo "  $0 logs user-service        # Show user service logs"
            exit 1
            ;;
    esac
}

# Handle script interruption
trap 'log_warning "Deployment interrupted"; exit 1' INT TERM

# Run main function with all arguments
main "$@"
