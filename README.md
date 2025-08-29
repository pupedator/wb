# PixelCyberZone Final

A modern internet cafe website and management system built with React (TypeScript) frontend and Node.js/Express backend.

## Project Structure

```
pixelcyberzonefinal/
├── backend/              # Node.js/Express API server
│   ├── src/
│   │   ├── controllers/  # Route handlers
│   │   ├── middleware/   # Authentication & error handling
│   │   ├── models/       # MongoDB/Mongoose models
│   │   ├── routes/       # API route definitions
│   │   ├── services/     # Business logic services
│   │   ├── types/        # TypeScript type definitions
│   │   └── server.ts     # Main server entry point
│   ├── .env              # Environment configuration
│   └── package.json      # Backend dependencies
├── components/           # React components
├── contexts/             # React contexts
├── hooks/               # Custom React hooks
├── i18n/                # Internationalization
├── App.tsx              # Main React app component
├── index.html           # HTML template
├── package.json         # Frontend dependencies
└── start.sh             # Quick start script
```

## 🚀 Quick Start

### Option 1: Use the startup script (Recommended)
```bash
# Navigate to the project directory
cd /Users/kamal/Desktop/pixelcyberzonefinal

# Run the startup script
./start.sh
```

### Option 2: Manual setup

1. **Prerequisites**:
   - Node.js (v18+)
   - MongoDB Community Edition
   - npm

2. **Install and start MongoDB**:
   ```bash
   brew tap mongodb/brew
   brew install mongodb-community
   brew services start mongodb/brew/mongodb-community
   ```

3. **Setup Backend**:
   ```bash
   cd backend
   npm install
   cp .env.example .env  # Edit .env as needed
   npm run build
   npm run dev           # Development mode
   # or
   npm start            # Production mode
   ```

4. **Setup Frontend** (in a new terminal):
   ```bash
   cd ..  # Back to root directory
   npm install
   npm run dev
   ```

## 🌐 Access URLs

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3001
- **API Health Check**: http://localhost:3001/health

## 🛠️ Backend API Features

### Authentication System
- User registration with email verification
- Secure login/logout with JWT tokens
- Password reset functionality
- Profile management

### Case Opening System
- Multiple case types with different rarities
- Point-based economy
- Reward distribution based on probability
- Case opening history tracking
- Promotional code system (admin only)

### Security Features
- JWT-based authentication
- Password hashing with bcrypt
- Rate limiting
- CORS protection
- Helmet security headers
- Input validation

## 🎮 Frontend Features

- Modern React with TypeScript
- Responsive design
- User authentication flow
- Case opening interface
- Profile management
- Interactive gallery
- Gaming facility showcase

## 📡 API Endpoints

### Public Endpoints
- `GET /health` - Server status
- `GET /api/cases` - Available cases
- `POST /api/auth/register` - User registration
- `POST /api/auth/verify-otp` - Email verification
- `POST /api/auth/login` - User login
- `POST /api/auth/forgot-password` - Password reset request

### Protected Endpoints (Requires Authentication)
- `GET /api/auth/profile` - User profile
- `PUT /api/auth/profile` - Update profile
- `POST /api/cases/open` - Open case
- `GET /api/cases/history` - Case opening history

### Admin Endpoints
- `POST /api/cases/promo-codes` - Generate promo codes
- `GET /api/cases/promo-codes` - List promo codes

## 🔧 Development

### Backend Development
```bash
cd backend
npm run dev          # Hot reload development
npm run build        # Build TypeScript
npm start           # Run production build
npm test            # Run tests (when available)
```

### Frontend Development
```bash
npm run dev         # Development server with hot reload
npm run build       # Build for production
npm run preview     # Preview production build
```

## 🌍 Environment Configuration

Key environment variables (backend/.env):

```env
# Database
MONGODB_URI=mongodb://localhost:27017/pixelcyberzone

# Server
PORT=3001
NODE_ENV=development

# Security
JWT_SECRET=your_secret_key_here
JWT_EXPIRY=24h

# Email (optional for development)
EMAIL_SERVICE=gmail
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password

# CORS
FRONTEND_URL=http://localhost:5173
```

## 🎯 Testing the Setup

1. **Test Backend API**:
   ```bash
   curl http://localhost:3001/health
   curl http://localhost:3001/api/cases
   ```

2. **Test Frontend**: 
   Open http://localhost:5173 in your browser

3. **Test Full Flow**:
   - Register a new account
   - Verify email (check console for OTP in development)
   - Login and explore the case opening system

## 🐛 Troubleshooting

### MongoDB Issues
- **Connection failed**: Make sure MongoDB is installed and running
  ```bash
  brew services restart mongodb/brew/mongodb-community
  ```

### Port Conflicts
- **Port 3001 in use**: Kill existing backend processes
  ```bash
  lsof -ti:3001 | xargs kill
  ```
- **Port 5173 in use**: Kill existing frontend processes
  ```bash
  lsof -ti:5173 | xargs kill
  ```

### Build Errors
- **TypeScript errors**: Check the console output for specific error details
- **Missing dependencies**: Run `npm install` in both root and backend directories

## 📧 Email Configuration (Optional)

For production or full testing, configure email in `backend/.env`:

1. Enable 2FA on your Gmail account
2. Generate an app password
3. Update the .env file:
   ```env
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASSWORD=your_app_password
   ```

## 🏆 Features Included

✅ Complete backend API with authentication  
✅ MongoDB database integration  
✅ Case opening system with rewards  
✅ User profile management  
✅ Email verification system  
✅ Admin promotional code system  
✅ Security middleware and validation  
✅ React frontend with TypeScript  
✅ Responsive design  
✅ Development environment setup  

The system is now fully functional and ready for local development and testing!
