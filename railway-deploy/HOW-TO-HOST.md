# 🎮 Host PixelCyberZone - Super Simple Guide

## 🔑 **Admin Credentials**
**Email:** `admin@pixelcyberzone.com`  
**Password:** `admin123456`

---

## 🚀 **Method 1: All-in-One Railway Hosting (Recommended)**

### **Step 1: Open Railway**
1. **Open your browser**
2. **Go to:** [https://railway.app](https://railway.app)
3. **Sign up** with your GitHub account (it's free!)

### **Step 2: Deploy Your App**
1. **Click "New Project"**
2. **Select "Empty Project"**
3. **Click "Deploy from GitHub repo"** OR **click the "+" and select "GitHub Repo"**
4. **Connect your GitHub** (if not already connected)
5. **Create a new repository** with the contents of this `railway-deploy` folder

### **Step 3: Add Database**
1. **In your Railway project**, click the **"+" button**
2. **Select "Database" → "Add MongoDB"**
3. **Railway will automatically create a MongoDB instance**
4. **Copy the connection string** from the database service

### **Step 4: Set Environment Variables**
1. **Click on your main service** (not the database)
2. **Go to "Variables" tab**
3. **Add these variables:**

```
MONGODB_URI=<paste the connection string from Step 3>
JWT_SECRET=pixelcyberzone_super_secret_jwt_key_2024
NODE_ENV=production
```

### **Step 5: Deploy & Test**
1. **Railway will automatically deploy** your app
2. **Get your live URL** from the Railway dashboard
3. **Visit your site** and test login with admin credentials above

---

## 🌐 **Method 2: Separate Frontend/Backend**

### **Frontend: Netlify**
1. **Go to:** [https://netlify.com](https://netlify.com)
2. **Drag and drop** the `public` folder from this directory
3. **Get your Netlify URL**

### **Backend: Railway** 
1. **Follow Steps 1-5 above** but only deploy the backend files
2. **Update CORS** to allow your Netlify domain

---

## 🎯 **What You Get**

After deployment, your live website will have:
- ✅ **Beautiful gaming cafe website**
- ✅ **User registration/login system**
- ✅ **Admin panel** (login with credentials above)
- ✅ **Promo code generation**
- ✅ **Case opening system**
- ✅ **Multi-language support**
- ✅ **Mobile responsive**

## 🔧 **Database Setup**

**You DON'T need to set up database manually!**
- Railway's MongoDB service handles everything
- Database collections are created automatically
- Admin user is seeded automatically

## ✅ **Quick Checklist**

- [ ] Railway account created
- [ ] Project deployed from this folder
- [ ] MongoDB database added
- [ ] Environment variables set
- [ ] Live URL working
- [ ] Admin login tested: `admin@pixelcyberzone.com` / `admin123456`

## 🎮 **Ready to Launch!**

Your gaming cafe website will be live at your Railway URL with full functionality including user accounts, admin panel, and the promo code system!

**Need help?** The Railway dashboard is very user-friendly - just follow the steps above and you'll have a live website in minutes! 🚀
