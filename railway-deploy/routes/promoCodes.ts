import { Router } from 'express';
import * as casesController from '../controllers/casesController.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';

const router = Router();

// Admin routes for promo codes
router.post('/generate', authenticateToken, requireAdmin, casesController.generatePromoCode);
router.post('/bulk', authenticateToken, requireAdmin, casesController.generateBulkPromoCodes);
router.get('/', authenticateToken, requireAdmin, casesController.getPromoCodes);

export default router;
