# 🚀 Deploy PixelCyberZone to Railway - Complete Guide

## 🔑 **Admin Panel Credentials**
- **Email:** `admin@pixelcyberzone.com`
- **Password:** `admin123456`

## 🌐 **One-Click Railway Deployment**

This folder contains **everything** you need - frontend + backend + database - all deployable to Railway!

### **Step 1: Get Railway Account**
1. Go to [https://railway.app](https://railway.app)
2. Sign up with GitHub (free)

### **Step 2: Deploy with Browser**
1. **Go to Railway dashboard**
2. **Click "New Project"**
3. **Select "Deploy from GitHub repo"** OR **"Upload folder"**
4. **Upload this entire `railway-deploy` folder**
5. Railway will automatically:
   - ✅ Detect your Node.js app
   - ✅ Install dependencies
   - ✅ Build and deploy
   - ✅ Provide you with a live URL!

### **Step 3: Add Database**
1. **In your Railway project**, click **"+ New"**
2. **Select "Database"** → **"Add MongoDB"**
3. **Copy the connection string** Railway provides
4. **Add it to environment variables** (see Step 4)

### **Step 4: Configure Environment Variables**
In your Railway project dashboard:
1. **Go to "Variables" tab**
2. **Add these variables:**

```
MONGODB_URI=mongodb://mongo:FVl2fOdOBSk6KaFFqHu4@railway-mongo:27017/pixelcyberzone
JWT_SECRET=pixelcyberzone_super_secret_jwt_key_2024
NODE_ENV=production
```

### **Step 5: Test Your Live Site**
1. **Visit your Railway URL** (something like `https://yourapp.railway.app`)
2. **Login as admin:** `admin@pixelcyberzone.com` / `admin123456`
3. **Test all features:**
   - ✅ User registration/login
   - ✅ Admin panel
   - ✅ Promo code generation
   - ✅ Case opening

## 🎯 **What This Folder Contains**

```
railway-deploy/
├── server.ts              # Main server (serves both API + frontend)
├── public/                # Built React frontend
├── config/                # Database configuration
├── controllers/           # API controllers
├── models/                # Database models
├── routes/                # API routes
├── middleware/            # Express middleware
├── package.json          # Dependencies
├── railway.json          # Railway configuration
└── .env.example          # Environment template
```

## ✅ **Features Included**
- ✅ **Complete authentication system**
- ✅ **Admin panel with promo code generation**
- ✅ **Case opening system**
- ✅ **Multi-language support** (English, Azerbaijani, Russian)
- ✅ **Authentication bug fixed**
- ✅ **All bonus points removed**
- ✅ **MongoDB integration**

## 🌟 **Railway Benefits**
- ✅ **Free tier available**
- ✅ **Automatic HTTPS**
- ✅ **Built-in database hosting**
- ✅ **No configuration needed**
- ✅ **One URL for everything**

## 🆘 **If You Need Help**

### **Railway Documentation:**
- [https://docs.railway.app](https://docs.railway.app)

### **Quick Support:**
1. **Upload this folder to Railway**
2. **Add MongoDB database**
3. **Set environment variables**
4. **Your site is live!**

---

## 🎮 **Ready to Go Live!**

**Just drag this `railway-deploy` folder to Railway and you'll have a complete gaming cafe website with:**
- User accounts
- Admin panel  
- Promo code system
- Case opening
- Multi-language support

**Admin credentials:** `admin@pixelcyberzone.com` / `admin123456` 🚀
