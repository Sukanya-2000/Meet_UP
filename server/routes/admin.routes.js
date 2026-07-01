import { Router } from 'express';
import {
  dashboard, listReports, listUsers, listVerifications, managePremium,
  reviewVerification, updateReport, updateUserStatus, listAuditLogs, listUnmatched, listPromptsForModeration, moderatePrompt, getSettings, updateSetting, listOpeningMoves, moderateOpeningMove, listQuestions, saveQuestion, moderationQueue,
} from '../controllers/admin.controller.js';
import { adminOnly } from '../middleware/admin.middleware.js';
import { protect } from '../middleware/auth.middleware.js';
import { validateBody } from '../middleware/validate.middleware.js';
import asyncHandler from '../utils/asyncHandler.js';

const router = Router();
router.use(protect, adminOnly);
router.get('/dashboard', asyncHandler(dashboard));
router.get('/users', asyncHandler(listUsers));
router.put('/users/:id/status', validateBody({ accountStatus: { required: true, enum: ['active', 'suspended', 'banned'] } }), asyncHandler(updateUserStatus));
router.put('/users/:id/premium', validateBody({ status: { required: true, enum: ['active', 'cancelled'] } }), asyncHandler(managePremium));
router.get('/reports', asyncHandler(listReports));
router.put('/reports/:id', validateBody({ status: { required: true, enum: ['reviewing', 'resolved', 'dismissed'] } }), asyncHandler(updateReport));
router.get('/verifications', asyncHandler(listVerifications));
router.put('/verifications/:id', validateBody({ status: { required: true, enum: ['approved', 'rejected'] } }), asyncHandler(reviewVerification));
router.get('/audit-logs', asyncHandler(listAuditLogs));
router.get('/unmatched', asyncHandler(listUnmatched));
router.get('/profile-prompts', asyncHandler(listPromptsForModeration));
router.put('/profile-prompts/:id', validateBody({ status: { required: true, enum: ['approved', 'rejected'] } }), asyncHandler(moderatePrompt));
router.get('/settings',asyncHandler(getSettings));
router.put('/settings/:key',asyncHandler(updateSetting));
router.get('/opening-moves',asyncHandler(listOpeningMoves));
router.put('/opening-moves/:id',asyncHandler(moderateOpeningMove));
router.get('/questions',asyncHandler(listQuestions));
router.post('/questions',asyncHandler(saveQuestion));
router.put('/questions/:id',asyncHandler(saveQuestion));
router.get('/moderation-queue',asyncHandler(moderationQueue));
export default router;
