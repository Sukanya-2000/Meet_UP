import express from 'express';
import { confirmCheckoutSession, createCheckoutSession } from '../controllers/payment.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import asyncHandler from '../utils/asyncHandler.js';

const router = express.Router();

router.post('/create-checkout-session', protect, asyncHandler(createCheckoutSession));
router.get('/checkout-session/:sessionId/confirm', protect, asyncHandler(confirmCheckoutSession));

export default router;
