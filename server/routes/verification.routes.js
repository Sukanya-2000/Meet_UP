import { Router } from 'express';
import { createVerification } from '../controllers/verification.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import asyncHandler from '../utils/asyncHandler.js';

const router = Router();
router.post('/', protect, asyncHandler(createVerification));
export default router;
