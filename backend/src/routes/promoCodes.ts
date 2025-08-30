import { Router } from 'express';
import * as casesController from '../controllers/casesController.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';

const router = Router();

// Admin routes for promo codes
router.post('/generate', authenticateToken, requireAdmin, casesController.generatePromoCode);
router.post('/bulk', authenticateToken, requireAdmin, casesController.generateBulkPromoCodes);
router.get('/', authenticateToken, requireAdmin, casesController.getPromoCodes);
router.delete('/cleanup-expired', authenticateToken, requireAdmin, casesController.cleanupExpiredPromoCodes);
router.post('/expire/:promoId', authenticateToken, requireAdmin, casesController.expirePromoCode);
router.get('/stats', authenticateToken, requireAdmin, casesController.getPromoCodeStats);

// Public validation endpoint (no auth required for checking)
router.post('/validate', casesController.validatePromoCode);

export default router;
