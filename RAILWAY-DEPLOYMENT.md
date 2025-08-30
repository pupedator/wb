# Railway Deployment Guide

This guide explains how to deploy PixelCyberZone to Railway using the private GitHub repository.

## 🚂 Railway Deployment Steps

### 1. Access Your Repository
Your private repository is available at:
**https://github.com/pupedator/pixelcyberzonefinal**

### 2. Deploy to Railway

1. **Login to Railway**
   - Go to [railway.app](https://railway.app)
   - Sign in with your GitHub account

2. **Create New Project**
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your repository: `pupedator/pixelcyberzonefinal`

3. **Configure Environment Variables**
   
   Add these environment variables in Railway dashboard:
   
   ```env
   # Database (Railway will provide MongoDB or use Railway's PostgreSQL)
   MONGODB_URI=your_mongodb_connection_string
   
   # Server Configuration
   PORT=3001
   NODE_ENV=production
   
   # JWT Security
   JWT_SECRET=your_super_secure_jwt_secret_here_at_least_32_characters
   JWT_EXPIRY=24h
   
   # Email Configuration (Optional)
   EMAIL_SERVICE=gmail
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASSWORD=your_app_password
   
   # CORS
   FRONTEND_URL=https://your-app-name.railway.app
   ```

4. **Database Setup Options**
   
   **Option A: Use Railway's Built-in Database**
   - In your Railway project, click "Add Service"
   - Choose "Database" → "MongoDB" or "PostgreSQL"
   - Railway will automatically set the connection string
   
   **Option B: External MongoDB (MongoDB Atlas)**
   - Create a free MongoDB Atlas cluster
   - Get the connection string
   - Set it as `MONGODB_URI` environment variable

### 3. Deployment Configuration

The repository includes these Railway-specific files:
- `railway.toml` - Railway deployment configuration
- `nixpacks.toml` - Build configuration
- `package.json` - Updated with Railway start scripts

### 4. Build Process

Railway will automatically:
1. Install dependencies (`npm ci --only=production`)
2. Build the frontend (`npm run build`)
3. Start the server (`npm start`)

### 5. Environment Variables Required

**Essential Variables:**
```env
JWT_SECRET=your_jwt_secret_minimum_32_characters_long
MONGODB_URI=your_database_connection_string
NODE_ENV=production
PORT=3001
```

**Optional Variables:**
```env
EMAIL_SERVICE=gmail
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password
FRONTEND_URL=https://your-app-name.railway.app
```

### 6. Post-Deployment

After successful deployment:

1. **Test the Application**
   - Visit your Railway app URL
   - Test user registration and login
   - Try the promo code system

2. **Admin Access**
   - Email: `admin@pixel.com`
   - Password: `4g#2kPU£23-Y[%z{`

3. **API Endpoints**
   - Health check: `https://your-app.railway.app/health`
   - API base: `https://your-app.railway.app/api`

## 🛠️ Troubleshooting

### Common Issues:

**Build Fails:**
- Check the Railway build logs
- Ensure all dependencies are in `package.json`
- Verify environment variables are set

**Database Connection:**
- Ensure MongoDB URI is correct
- Check database service is running
- Verify network access from Railway

**Environment Variables Missing:**
- JWT_SECRET must be at least 32 characters
- MongoDB URI must be valid
- Check all required variables are set

### Debugging Steps:

1. **Check Railway Logs:**
   - Go to Railway dashboard
   - Click on your service
   - View "Logs" tab for errors

2. **Test API Endpoints:**
   ```bash
   curl https://your-app.railway.app/health
   curl https://your-app.railway.app/api/cases
   ```

3. **Database Connection Test:**
   - Check if database service is running
   - Verify connection string format
   - Test database connectivity

## 🔐 Security Notes

- The repository is **private** - only you can see it
- Railway can access private repositories when you connect your GitHub account
- All sensitive data should be in environment variables, not in code
- JWT_SECRET should be cryptographically secure (32+ characters)

## 🚀 Deployment Commands

If you need to redeploy manually:

```bash
# Push changes to trigger redeployment
git add .
git commit -m "Update: description of changes"
git push origin master
```

Railway will automatically detect changes and redeploy.

## 📱 Features Available After Deployment

✅ **Frontend Features:**
- React-based gaming cafe website
- Multi-language support (EN, AZ, RU)
- User registration and authentication
- Case opening system
- User cabinet/profile management

✅ **Backend API:**
- RESTful API with authentication
- Promo code generation and validation
- Case opening with rewards
- User management
- Admin panel functionality

✅ **Database:**
- User data storage
- Case history tracking
- Promo code management
- Reward system data

Your application is now ready for production use! 🎉
