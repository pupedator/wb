# Multi-stage build for production
FROM node:18-alpine AS builder

WORKDIR /app

# Install curl for health checks
RUN apk add --no-cache curl

# Copy package files
COPY package*.json ./
COPY frontend/package*.json ./frontend/
COPY backend/package*.json ./backend/

# Install dependencies
RUN npm run install:all

# Copy source code
COPY . .

# Build the applications
RUN npm run build

# Production stage
FROM node:18-alpine AS production

WORKDIR /app

# Install curl for health checks
RUN apk add --no-cache curl

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S appuser -u 1001

# Copy built applications and dependencies
COPY --from=builder --chown=appuser:nodejs /app/frontend/dist ./frontend/dist
COPY --from=builder --chown=appuser:nodejs /app/backend/dist ./backend/dist
COPY --from=builder --chown=appuser:nodejs /app/backend/node_modules ./backend/node_modules
COPY --from=builder --chown=appuser:nodejs /app/backend/package.json ./backend/package.json

# Switch to non-root user
USER appuser

# Expose port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:3001/health || exit 1

# Start the application
CMD ["node", "backend/dist/server.js"]
