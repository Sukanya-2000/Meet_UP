import { Router } from 'express';
import { getMatches, unmatch } from '../controllers/match.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import asyncHandler from '../utils/asyncHandler.js';

const router = Router();
router.get('/', protect, asyncHandler(getMatches));
router.delete('/:id', protect, asyncHandler(unmatch));
export default router;
