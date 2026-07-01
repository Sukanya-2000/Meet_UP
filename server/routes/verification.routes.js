import { Router } from 'express';
import { createVerification, getVerificationStatus, retryVerification } from '../controllers/verification.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import asyncHandler from '../utils/asyncHandler.js';

const router = Router();
router.post('/', protect, asyncHandler(createVerification));
router.get('/', protect, asyncHandler(getVerificationStatus));
router.post('/:id/retry', protect, asyncHandler(retryVerification));
export default router;
