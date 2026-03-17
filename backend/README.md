# Gaming Cafe Backend API

A Node.js/Express backend API for the Gaming Cafe internet cafe management system.

## Prerequisites

- Node.js (v18+)
- MongoDB Community Edition
- npm

## Quick Start

1. **Install MongoDB** (if not already installed):
   ```bash
   brew tap mongodb/brew
   brew install mongodb-community
   ```

2. **Start MongoDB**:
   ```bash
   brew services start mongodb/brew/mongodb-community
   ```

3. **Install dependencies**:
   ```bash
   npm install
   ```

4. **Set up environment variables**:
   ```bash
   cp .env.example .env
   # Edit .env file with your configuration
   ```

5. **Build the project**:
   ```bash
   npm run build
   ```

6. **Start the server**:

   **Development mode** (with hot reload):
   ```bash
   npm run dev
   ```

   **Production mode**:
   ```bash
   npm start
   ```

## API Endpoints

The server runs on `http://localhost:3001` by default.

### Health Check
- `GET /health` - Server health status

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/verify-otp` - Email verification
- `POST /api/auth/resend-otp` - Resend verification code
- `POST /api/auth/login` - User login
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password with OTP
- `GET /api/auth/profile` - Get user profile (protected)
- `PUT /api/auth/profile` - Update user profile (protected)

### Cases
- `GET /api/cases` - Get available cases
- `POST /api/cases/validate-promo` - Validate promo code compatibility with case
- `POST /api/cases/open` - Open a case with promo code (protected)
- `GET /api/cases/history` - Get user's case opening history (protected)
- `POST /api/cases/promo-codes` - Generate single promo code (admin only)
- `POST /api/cases/promo-codes/bulk` - Generate multiple promo codes (admin only)
- `GET /api/cases/promo-codes` - List promo codes with optional case filtering (admin only)

## Environment Variables

See `.env.example` for all available configuration options.

Key variables:
- `MONGODB_URI` - MongoDB connection string
- `PORT` - Server port (default: 3001)
- `JWT_SECRET` - Secret key for JWT tokens
- `FRONTEND_URL` - Frontend URL for CORS (default: http://localhost:5173)

## Development Notes

- **Point system removed**: Cases now require promo codes to open (no points needed)
- **Case-specific promo codes**: Each promo code is tied to a specific case type
- Email service is optional in development mode
- OTP codes will be logged to console when email is not configured
- MongoDB must be running for the server to start
- TypeScript compilation is required before running in production mode
- Default admin user: `admin@gamingcafe.com` / `admin123456`

## Promo Code System

### Admin Functions
- Generate single promo codes for specific cases
- Generate bulk promo codes (up to 100 at once)
- Set custom expiration times
- View all promo codes with case filtering
- Case-specific validation ensures codes only work with intended cases

### User Functions
- Validate promo code compatibility before use
- Open cases using valid promo codes
- View case opening history

### Key Features
- **Case-specific**: Promo codes are tied to specific case types
- **One-time use**: Each code can only be used once
- **Expiration**: Codes have configurable expiration times
- **Admin tracking**: Full audit trail of code creation and usage

## Database Schema

The API uses MongoDB with Mongoose ODM. Models include:
- **User** - User accounts and authentication (no points field)
- **OTP** - Email verification codes
- **CaseHistory** - Record of case openings (no points tracking)
- **PromoCode** - Case-specific promotional codes for free cases

## Database Management

### Seeding Scripts

```bash
# Create admin user only
npm run seed:admin

# Seed all data (admin + sample promo codes)
npm run seed:all

# Fresh start (drop all collections and reseed)
npm run seed:fresh

# Create database indexes for performance
npm run db:indexes
```

### Default Admin Credentials
- **Email**: `admin@gamingcafe.com`
- **Password**: `Admin123!@#` (configurable via `ADMIN_PASSWORD` env var)

## Production Database Setup

### Option 1: MongoDB Atlas (Recommended)
1. Create account at [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create cluster and get connection string
3. Update `.env`:
   ```env
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/gamingcafe
   ```

### Option 2: Local MongoDB
```bash
# Install (macOS)
brew tap mongodb/brew
brew install mongodb-community

# Start service
brew services start mongodb/brew/mongodb-community
```

## Enhanced Features

### Security & Performance
- **Connection Pooling**: Optimized MongoDB connections
- **Retry Logic**: Automatic reconnection with backoff
- **Database Indexes**: Optimized for query performance
- **Input Validation**: Comprehensive data validation
- **Rate Limiting**: API abuse prevention

### Monitoring
- **Health Endpoints**: Server and database status
- **Detailed Logging**: Development and production logs
- **Error Handling**: Comprehensive error management
