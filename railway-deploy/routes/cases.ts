import { Router } from 'express';
import * as casesController from '../controllers/casesController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

// Public routes
router.get('/', casesController.getCases);
router.post('/validate-promo', casesController.validatePromoCode);

// Protected user routes
router.post('/:caseId/open', authenticateToken, casesController.openCase);
router.get('/history', authenticateToken, casesController.getCaseHistory);

export default router;
