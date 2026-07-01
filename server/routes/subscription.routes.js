import { Router } from 'express';
import { getMySubscription } from '../controllers/subscription.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import asyncHandler from '../utils/asyncHandler.js';

const router = Router();
router.get('/me', protect, asyncHandler(getMySubscription));
export default router;
