import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '.env') });

const app = express();
const PORT = 3001;

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true
}));
app.use(express.json());

// Simple PromoCode model for testing
const promoCodeSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true, uppercase: true },
  caseId: { type: String, required: true },
  status: { type: String, enum: ['active', 'used', 'expired'], default: 'active' },
  createdBy: { type: String, required: true },
  expiresAt: { type: Date, default: () => new Date(Date.now() + 24 * 60 * 60 * 1000) },
  usageAttempts: { type: Number, default: 0 }
}, { timestamps: true });

const PromoCode = mongoose.model('PromoCode', promoCodeSchema);

// Test admin user
const testAdmin = {
  userId: 'admin-test',
  email: 'admin@pixel.com',
  role: 'admin'
};

// Simple auth middleware for testing
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ success: false, message: 'Access token required' });
  }
  
  // For testing, just use a simple check
  if (token === 'test-admin-token') {
    req.user = testAdmin;
    next();
  } else {
    res.status(403).json({ success: false, message: 'Invalid token' });
  }
};

const requireAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ success: false, message: 'Admin access required' });
  }
};

// Test cases data
const CASES = [
  {
    id: 'cyber-starter',
    name: 'Cyber Starter',
    price: 'Promo Code Required',
    image: '/images/cases/cyber-starter.png'
  },
  {
    id: 'pro-gamer',
    name: 'Pro Gamer',
    price: 'Promo Code Required',
    image: '/images/cases/pro-gamer.png'
  },
  {
    id: 'elite-master',
    name: 'Elite Master',
    price: 'Promo Code Required',
    image: '/images/cases/elite-master.png'
  }
];

// Routes
app.get('/health', (req, res) => {
  res.json({ success: true, message: 'Test server is healthy' });
});

// Auth endpoint for testing
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  if (email === 'admin@pixel.com' && password === '4g#2kPU£23-Y[%z{') {
    res.json({
      success: true,
      token: 'test-admin-token',
      user: { id: 'admin-test', name: 'Admin', email, role: 'admin' }
    });
  } else {
    res.status(401).json({ success: false, message: 'Invalid credentials' });
  }
});

// Get cases
app.get('/api/cases', (req, res) => {
  res.json({ success: true, cases: CASES });
});

// Generate promo code
app.post('/api/promo-codes/generate', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { caseId } = req.body;
    
    if (!caseId) {
      return res.status(400).json({ success: false, message: 'Case ID is required' });
    }
    
    const selectedCase = CASES.find(c => c.id === caseId);
    if (!selectedCase) {
      return res.status(404).json({ success: false, message: 'Case not found' });
    }
    
    // Generate unique code with case prefix
    const casePrefix = selectedCase.name.toUpperCase().replace(/[^A-Z0-9]/g, '').substring(0, 4);
    const timestamp = Date.now().toString(36).toUpperCase();
    const randomPart = Math.random().toString(36).substring(2, 6).toUpperCase();
    const code = `${casePrefix}-${timestamp}-${randomPart}`;
    
    const promoCode = await PromoCode.create({
      code,
      caseId,
      createdBy: req.user.userId
    });
    
    res.json({
      success: true,
      message: `Promo code generated successfully for ${selectedCase.name}`,
      code: promoCode.code
    });
  } catch (error) {
    console.error('Generate promo code error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Get promo codes
app.get('/api/promo-codes', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const promoCodes = await PromoCode.find().sort({ createdAt: -1 });
    
    const promoCodesWithCaseNames = promoCodes.map(promo => {
      const caseInfo = CASES.find(c => c.id === promo.caseId);
      return {
        ...promo.toObject(),
        id: promo._id.toString(),
        caseName: caseInfo?.name || 'Unknown Case'
      };
    });
    
    res.json({
      success: true,
      promoCodes: promoCodesWithCaseNames
    });
  } catch (error) {
    console.error('Get promo codes error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Validate promo code
app.post('/api/promo-codes/validate', async (req, res) => {
  try {
    const { caseId, promoCode } = req.body;
    
    if (!caseId || !promoCode) {
      return res.status(400).json({ success: false, message: 'Case ID and promo code are required' });
    }
    
    const selectedCase = CASES.find(c => c.id === caseId);
    if (!selectedCase) {
      return res.status(404).json({ success: false, message: 'Case not found' });
    }
    
    const promo = await PromoCode.findOne({
      code: promoCode.toUpperCase(),
      caseId
    });
    
    if (!promo) {
      const anyPromo = await PromoCode.findOne({ code: promoCode.toUpperCase() });
      if (anyPromo && anyPromo.caseId !== caseId) {
        return res.status(400).json({
          success: false,
          message: `This promo code is for a different case, not ${selectedCase.name}`,
          compatible: false
        });
      } else {
        return res.status(400).json({
          success: false,
          message: `Promo code is not valid for ${selectedCase.name} case`,
          compatible: false
        });
      }
    }
    
    if (promo.status === 'used') {
      return res.status(400).json({
        success: false,
        message: 'Promo code has already been used',
        compatible: false
      });
    }
    
    if (promo.expiresAt && new Date() > promo.expiresAt) {
      return res.status(400).json({
        success: false,
        message: 'Promo code has expired',
        compatible: false
      });
    }
    
    res.json({
      success: true,
      message: `Promo code is valid for ${selectedCase.name}`,
      compatible: true,
      caseId,
      caseName: selectedCase.name,
      expiresAt: promo.expiresAt?.toISOString()
    });
  } catch (error) {
    console.error('Validate promo code error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Start server
const startServer = async () => {
  try {
    // Connect to MongoDB
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/pixelcyberzone-test');
    console.log('✅ MongoDB connected');
    
    app.listen(PORT, () => {
      console.log(`🚀 Test server running on http://localhost:${PORT}`);
      console.log('📋 Available endpoints:');
      console.log(`  🏥 Health: http://localhost:${PORT}/health`);
      console.log(`  🔐 Login: POST http://localhost:${PORT}/api/auth/login`);
      console.log(`  🎁 Cases: http://localhost:${PORT}/api/cases`);
      console.log(`  🎫 Generate Promo: POST http://localhost:${PORT}/api/promo-codes/generate`);
      console.log(`  📜 List Promos: GET http://localhost:${PORT}/api/promo-codes`);
      console.log(`  ✅ Validate Promo: POST http://localhost:${PORT}/api/promo-codes/validate`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
