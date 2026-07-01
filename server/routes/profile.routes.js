import { Router } from 'express';
import { getMyProfile, saveBasicProfile, saveInterests, updateDiscoveryPrivacy, updateLocation, updateProfile, updateTravelMode } from '../controllers/profile.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import asyncHandler from '../utils/asyncHandler.js';

const router = Router();

router.post('/basic', protect, asyncHandler(saveBasicProfile));
router.post('/interests', protect, asyncHandler(saveInterests));
router.get('/me', protect, asyncHandler(getMyProfile));
router.put('/update', protect, asyncHandler(updateProfile));
router.put('/location', protect, asyncHandler(updateLocation));
router.put('/privacy', protect, asyncHandler(updateDiscoveryPrivacy));
router.put('/travel', protect, asyncHandler(updateTravelMode));

export default router;
