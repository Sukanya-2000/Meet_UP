import { Router } from 'express';
import { createSwipe, rewindSwipe } from '../controllers/swipe.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import asyncHandler from '../utils/asyncHandler.js';

const router = Router();
router.post('/', protect, asyncHandler(createSwipe));
router.delete('/rewind', protect, asyncHandler(rewindSwipe));
export default router;
