import { Router } from 'express';
import { createLike } from '../controllers/like.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import asyncHandler from '../utils/asyncHandler.js';

const router = Router();
router.post('/', protect, asyncHandler(createLike));
export default router;
