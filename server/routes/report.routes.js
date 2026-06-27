import { Router } from 'express';
import { createReport } from '../controllers/report.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { validateBody } from '../middleware/validate.middleware.js';
import asyncHandler from '../utils/asyncHandler.js';

const router = Router();
router.post('/', protect, validateBody({
  reportedUserId: { required: true, type: 'string' },
  reason: { required: true, enum: ['fake-profile', 'harassment', 'spam', 'inappropriate-content', 'other'] },
}), asyncHandler(createReport));
export default router;
