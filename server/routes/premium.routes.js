import { Router } from 'express';
import { boostProfile, getLikesYou } from '../controllers/premium.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { requirePremium } from '../middleware/premium.middleware.js';
import asyncHandler from '../utils/asyncHandler.js';

const router = Router();
router.use(protect);
router.use(requirePremium);
router.get('/likes-you', asyncHandler(getLikesYou));
router.post('/boost', asyncHandler(boostProfile));
export default router;
