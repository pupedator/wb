import { Request, Response } from 'express';
import User from '../models/User.js';
import CaseHistory from '../models/CaseHistory.js';
import PromoCode from '../models/PromoCode.js';
import { 
  AuthRequest, 
  CaseOpenResponse, 
  PromoCodeRequest, 
  PromoCodeResponse,
  Case,
  CaseReward
} from '../types/index.js';

/**
 * TODO: Move this to database eventually
 * For now, keeping these as static data since we're still in development
 * and the cases don't change very often
 */
const availableCases: Case[] = [
  {
    id: 'cyber-starter',
    name: 'Cyber Starter',
    price: 'Promo Code Required',
    image: '/images/cases/cyber-starter.png',
    rewards: [
      { id: '1', name: 'Gaming Mouse Pad', rarity: 'common', image: '/images/rewards/mousepad.png', chance: 40 },
      { id: '2', name: 'Energy Drink', rarity: 'common', image: '/images/rewards/energy-drink.png', chance: 30 },
      { id: '3', name: 'Gaming Headset', rarity: 'uncommon', image: '/images/rewards/headset.png', chance: 20 },
      { id: '4', name: 'Mechanical Keyboard', rarity: 'rare', image: '/images/rewards/keyboard.png', chance: 8 },
      { id: '5', name: 'Gaming Chair Voucher', rarity: 'legendary', image: '/images/rewards/chair-voucher.png', chance: 2 }
    ]
  },
  {
    id: 'pro-gamer',
    name: 'Pro Gamer',
    price: 'Promo Code Required',
    image: '/images/cases/pro-gamer.png',
    rewards: [
      { id: '6', name: 'RGB Mouse', rarity: 'uncommon', image: '/images/rewards/rgb-mouse.png', chance: 35 },
      { id: '7', name: 'Gaming Monitor Stand', rarity: 'uncommon', image: '/images/rewards/monitor-stand.png', chance: 25 },
      { id: '8', name: 'High-End Headphones', rarity: 'rare', image: '/images/rewards/headphones.png', chance: 25 },
      { id: '9', name: 'Gaming Laptop Voucher', rarity: 'rare', image: '/images/rewards/laptop-voucher.png', chance: 10 },
      { id: '10', name: 'VIP Gaming Session', rarity: 'legendary', image: '/images/rewards/vip-session.png', chance: 5 }
    ]
  },
  {
    id: 'elite-master',
    name: 'Elite Master',
    price: 'Promo Code Required',
    image: '/images/cases/elite-master.png',
    rewards: [
      { id: '11', name: 'Premium Gaming Setup', rarity: 'rare', image: '/images/rewards/gaming-setup.png', chance: 40 },
      { id: '12', name: 'Professional Gaming Chair', rarity: 'rare', image: '/images/rewards/pro-chair.png', chance: 30 },
      { id: '13', name: 'High-End Graphics Card', rarity: 'legendary', image: '/images/rewards/graphics-card.png', chance: 20 },
      { id: '14', name: 'Gaming PC Upgrade Package', rarity: 'legendary', image: '/images/rewards/pc-upgrade.png', chance: 10 }
    ]
  }
];

/**
 * This is where the magic happens - selecting random rewards
 * Took me a while to get this probability algorithm right
 * Basically we roll a dice (0-100) and see which reward bracket it lands in
 */
const selectReward = (rewards: CaseReward[]): CaseReward => {
  const randomRoll = Math.random() * 100;
  let currentChance = 0;
  
  // Go through each reward and add up the chances
  for (const reward of rewards) {
    currentChance += reward.chance;
    if (randomRoll <= currentChance) {
      return reward;
    }
  }
  
  // Should never happen, but just in case... safety first!
  return rewards[0];
};


export const getCases = async (_req: Request, res: Response): Promise<void> => {
  try {
    res.json({
      success: true,
      cases: availableCases
    });
  } catch (error) {
    console.error('Get cases error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const openCase = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    const caseId = req.params.caseId;
    const { promoCode }: { promoCode: string } = req.body;

    if (!caseId) {
      res.status(400).json({ success: false, message: 'Case ID is required' });
      return;
    }

    // Promo code is now required to open cases
    if (!promoCode) {
      res.status(400).json({ success: false, message: 'Promo code is required to open cases' });
      return;
    }

    // Find the case
    const selectedCase = availableCases.find(c => c.id === caseId);
    if (!selectedCase) {
      res.status(404).json({ success: false, message: 'Case not found' });
      return;
    }

    const user = await User.findById(req.user.userId);
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    // Verify promo code is valid and matches the case
    const promo = await PromoCode.findOne({ 
      code: promoCode.toUpperCase(), 
      caseId,  // Ensures promo code is specific to this case
      status: 'active' 
    });

    if (!promo) {
      // Log failed attempt for security monitoring
      const existingPromo = await PromoCode.findOne({ code: promoCode.toUpperCase() });
      if (existingPromo) {
        existingPromo.usageAttempts += 1;
        existingPromo.lastAttemptAt = new Date();
        
        // If too many failed attempts, mark as suspicious
        if (existingPromo.usageAttempts >= 10) {
          existingPromo.status = 'expired';
        }
        await existingPromo.save();
      }
      
      res.status(400).json({ 
        success: false, 
        message: `Invalid or incompatible promo code for ${selectedCase.name} case` 
      });
      return;
    }

    if (!promo.isValid()) {
      // Auto-expire codes that are past expiration
      if (promo.expiresAt && new Date() > promo.expiresAt) {
        promo.status = 'expired';
        await promo.save();
      }
      res.status(400).json({ success: false, message: 'Promo code has expired' });
      return;
    }

    // Check if user has already used a promo code for this case recently (prevent abuse)
    const recentUsage = await CaseHistory.findOne({
      userId: user._id.toString(),
      caseId,
      createdAt: { $gte: new Date(Date.now() - 60 * 60 * 1000) } // Within last hour
    });

    if (recentUsage) {
      res.status(429).json({ 
        success: false, 
        message: 'You can only open one case per hour. Please try again later.' 
      });
      return;
    }

    // Select a random reward
    const selectedReward = selectReward(selectedCase.rewards);

    // Mark promo code as used
    promo.status = 'used';
    promo.usedBy = user._id.toString();
    promo.usedAt = new Date();
    await promo.save();

    // Record the case opening in history
    await CaseHistory.create({
      userId: user._id.toString(),
      rewardName: selectedReward.name,
      rewardRarity: selectedReward.rarity,
      rewardImage: selectedReward.image,
      caseName: selectedCase.name,
      caseId: selectedCase.id
    });

    const response: CaseOpenResponse = {
      success: true,
      message: `Case opened successfully! You won: ${selectedReward.name}`,
      reward: {
        name: selectedReward.name,
        rarity: selectedReward.rarity,
        image: selectedReward.image
      }
    };

    res.json(response);
  } catch (error) {
    console.error('Open case error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const getCaseHistory = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const history = await CaseHistory.find({ userId: req.user.userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await CaseHistory.countDocuments({ userId: req.user.userId });

    res.json({
      success: true,
      history,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get case history error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const generatePromoCode = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      res.status(403).json({ success: false, message: 'Admin access required' });
      return;
    }

    const { caseId }: PromoCodeRequest = req.body;

    if (!caseId) {
      res.status(400).json({ success: false, message: 'Case ID is required' });
      return;
    }

    // Verify the case exists
    const selectedCase = availableCases.find(c => c.id === caseId);
    if (!selectedCase) {
      res.status(404).json({ success: false, message: 'Case not found' });
      return;
    }

    // Generate a unique promo code with case prefix for better identification
    // Had to debug this regex for a while - special chars were breaking the codes
    const casePrefix = selectedCase.name.toUpperCase().replace(/[^A-Z0-9]/g, '').substring(0, 4);
    const timestamp = Date.now().toString(36).toUpperCase();
    const randomPart = Math.random().toString(36).substring(2, 6).toUpperCase();
    const generatedCode = `${casePrefix}-${timestamp}-${randomPart}`;

    // Check for code uniqueness (very unlikely collision but good practice)
    const existingCode = await PromoCode.findOne({ code: generatedCode });
    if (existingCode) {
      // Generate a new random part if collision occurs
      const newRandomPart = Math.random().toString(36).substring(2, 8).toUpperCase();
      const newCode = `${casePrefix}-${timestamp}-${newRandomPart}`;
      
      const promoCode = await PromoCode.create({
        code: newCode,
        caseId,
        createdBy: req.user.userId,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
      });

      const response: PromoCodeResponse = {
        success: true,
        message: `Promo code generated successfully for ${selectedCase.name}`,
        code: promoCode.code
      };

      res.json(response);
    } else {
      const promoCode = await PromoCode.create({
        code: generatedCode,
        caseId,
        createdBy: req.user.userId,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
      });

      const response: PromoCodeResponse = {
        success: true,
        message: `Promo code generated successfully for ${selectedCase.name}`,
        code: promoCode.code
      };

      res.json(response);
    }
  } catch (error: any) {
    console.error('Generate promo code error:', error);
    if (error.code === 11000) {
      // Duplicate key error - try again with different code
      res.status(409).json({ success: false, message: 'Code generation conflict, please try again' });
    } else {
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }
};

export const getPromoCodes = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      res.status(403).json({ success: false, message: 'Admin access required' });
      return;
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;
    const caseId = req.query.caseId as string;

    // Filter by case if specified
    const filter = caseId ? { caseId } : {};

    const promoCodes = await PromoCode.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('createdBy', 'name email')
      .populate('usedBy', 'name email');

    const total = await PromoCode.countDocuments(filter);

    // Add case name to each promo code
    const promoCodesWithCaseNames = promoCodes.map(promo => {
      const caseInfo = availableCases.find(c => c.id === promo.caseId);
      return {
        ...promo.toJSON(),
        caseName: caseInfo?.name || 'Unknown Case'
      };
    });

    res.json({
      success: true,
      promoCodes: promoCodesWithCaseNames,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get promo codes error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// Generate multiple promo codes at once
export const generateBulkPromoCodes = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      res.status(403).json({ success: false, message: 'Admin access required' });
      return;
    }

    const { caseId, count = 1, expirationHours = 24 }: { 
      caseId: string; 
      count?: number; 
      expirationHours?: number; 
    } = req.body;

    if (!caseId) {
      res.status(400).json({ success: false, message: 'Case ID is required' });
      return;
    }

    if (count < 1 || count > 100) {
      res.status(400).json({ success: false, message: 'Count must be between 1 and 100' });
      return;
    }

    // Verify the case exists
    const selectedCase = availableCases.find(c => c.id === caseId);
    if (!selectedCase) {
      res.status(404).json({ success: false, message: 'Case not found' });
      return;
    }

    const codes: string[] = [];
    const expiresAt = new Date(Date.now() + expirationHours * 60 * 60 * 1000);

    for (let i = 0; i < count; i++) {
      const code = `${selectedCase.name.toUpperCase().replace(/\s+/g, '')}${Date.now().toString(36).toUpperCase()}${Math.random().toString(36).substr(2, 3).toUpperCase()}`;
      
      await PromoCode.create({
        code,
        caseId,
        createdBy: req.user.userId,
        expiresAt
      });
      
      codes.push(code);
    }

    res.json({
      success: true,
      message: `${count} promo code(s) generated successfully for ${selectedCase.name}`,
      codes,
      caseId,
      caseName: selectedCase.name,
      expiresAt: expiresAt.toISOString()
    });
  } catch (error) {
    console.error('Generate bulk promo codes error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// Validate if a promo code is compatible with a case
export const validatePromoCode = async (req: Request, res: Response): Promise<void> => {
  try {
    const { caseId, promoCode }: { caseId: string; promoCode: string } = req.body;

    if (!caseId || !promoCode) {
      res.status(400).json({ success: false, message: 'Case ID and promo code are required' });
      return;
    }

    // Find the case
    const selectedCase = availableCases.find(c => c.id === caseId);
    if (!selectedCase) {
      res.status(404).json({ success: false, message: 'Case not found' });
      return;
    }

    // Check if promo code exists and is for this specific case
    const promo = await PromoCode.findOne({ 
      code: promoCode.toUpperCase(),
      caseId  // This ensures the promo code is only valid for the specific case
    });

    if (!promo) {
      // Log failed validation attempt
      const anyPromo = await PromoCode.findOne({ code: promoCode.toUpperCase() });
      if (anyPromo && anyPromo.caseId !== caseId) {
        // Code exists but for different case
        res.status(400).json({ 
          success: false, 
          message: `This promo code is for a different case, not ${selectedCase.name}`,
          compatible: false
        });
      } else {
        // Code doesn't exist at all
        res.status(400).json({ 
          success: false, 
          message: `Promo code is not valid for ${selectedCase.name} case`,
          compatible: false
        });
      }
      return;
    }

    if (promo.status === 'used') {
      res.status(400).json({ 
        success: false, 
        message: 'Promo code has already been used',
        compatible: false
      });
      return;
    }

    if (!promo.isValid()) {
      res.status(400).json({ 
        success: false, 
        message: 'Promo code has expired',
        compatible: false
      });
      return;
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
};

// Admin function to clean up expired promo codes
export const cleanupExpiredPromoCodes = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      res.status(403).json({ success: false, message: 'Admin access required' });
      return;
    }

    // Find and update expired codes
    const expiredCount = await PromoCode.updateMany(
      {
        status: 'active',
        expiresAt: { $lt: new Date() }
      },
      {
        status: 'expired'
      }
    );

    res.json({
      success: true,
      message: `${expiredCount.modifiedCount} expired promo codes cleaned up`,
      cleanedCount: expiredCount.modifiedCount
    });
  } catch (error) {
    console.error('Cleanup expired promo codes error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// Admin function to manually expire a promo code
export const expirePromoCode = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      res.status(403).json({ success: false, message: 'Admin access required' });
      return;
    }

    const { promoId } = req.params;

    if (!promoId) {
      res.status(400).json({ success: false, message: 'Promo code ID is required' });
      return;
    }

    const promo = await PromoCode.findById(promoId);
    if (!promo) {
      res.status(404).json({ success: false, message: 'Promo code not found' });
      return;
    }

    if (promo.status === 'used') {
      res.status(400).json({ success: false, message: 'Cannot expire a promo code that has already been used' });
      return;
    }

    promo.status = 'expired';
    await promo.save();

    res.json({
      success: true,
      message: 'Promo code expired successfully',
      code: promo.code
    });
  } catch (error) {
    console.error('Expire promo code error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// Admin function to get promo code statistics
export const getPromoCodeStats = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      res.status(403).json({ success: false, message: 'Admin access required' });
      return;
    }

    const totalCodes = await PromoCode.countDocuments();
    const activeCodes = await PromoCode.countDocuments({ status: 'active' });
    const usedCodes = await PromoCode.countDocuments({ status: 'used' });
    const expiredCodes = await PromoCode.countDocuments({ status: 'expired' });
    
    // Stats by case
    const caseStats = await Promise.all(
      availableCases.map(async (caseItem) => {
        const caseTotal = await PromoCode.countDocuments({ caseId: caseItem.id });
        const caseActive = await PromoCode.countDocuments({ caseId: caseItem.id, status: 'active' });
        const caseUsed = await PromoCode.countDocuments({ caseId: caseItem.id, status: 'used' });
        const caseExpired = await PromoCode.countDocuments({ caseId: caseItem.id, status: 'expired' });
        
        return {
          caseId: caseItem.id,
          caseName: caseItem.name,
          total: caseTotal,
          active: caseActive,
          used: caseUsed,
          expired: caseExpired
        };
      })
    );

    // Recent usage stats
    const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const recentUsage = await PromoCode.countDocuments({ 
      usedAt: { $gte: last24Hours }
    });

    res.json({
      success: true,
      stats: {
        total: totalCodes,
        active: activeCodes,
        used: usedCodes,
        expired: expiredCodes,
        recentUsage,
        caseBreakdown: caseStats
      }
    });
  } catch (error) {
    console.error('Get promo code stats error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};
