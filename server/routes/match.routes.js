import { Router } from 'express';
import { getMatches } from '../controllers/match.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import asyncHandler from '../utils/asyncHandler.js';

const router = Router();
router.get('/', protect, asyncHandler(getMatches));
export default router;
