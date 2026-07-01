import express from 'express';
import { confirmCheckoutSession, createCheckoutSession, getEntitlements, verifyStorePurchase } from '../controllers/payment.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import asyncHandler from '../utils/asyncHandler.js';

const router = express.Router();

router.post('/create-checkout-session', protect, asyncHandler(createCheckoutSession));
router.get('/checkout-session/:sessionId/confirm', protect, asyncHandler(confirmCheckoutSession));
router.get('/entitlements', protect, asyncHandler(getEntitlements));
router.post('/store/verify', protect, asyncHandler(verifyStorePurchase));
router.post('/store/restore', protect, asyncHandler(verifyStorePurchase));

export default router;
