import { Router } from 'express';
import { createSubscription, getMySubscription, subscriptionWebhook } from '../controllers/subscription.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { validateBody } from '../middleware/validate.middleware.js';
import asyncHandler from '../utils/asyncHandler.js';

const router = Router();
router.get('/me', protect, asyncHandler(getMySubscription));
router.post('/create', protect, validateBody({ plan: { enum: ['premium'] } }), asyncHandler(createSubscription));
router.post('/webhook', asyncHandler(subscriptionWebhook));
export default router;
