import { Router } from 'express';
import {
  blockUser, createCheckIn, getMyTrust, listBlocked, listCheckIns,
  reportAndOptionallyBlock, unblockUser, updateCheckIn,
} from '../controllers/safety.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { validateBody } from '../middleware/validate.middleware.js';
import asyncHandler from '../utils/asyncHandler.js';

const router = Router();
router.use(protect);
router.get('/blocked', asyncHandler(listBlocked));
router.post('/block', validateBody({ blockedUserId: { required: true, type: 'string' } }), asyncHandler(blockUser));
router.delete('/block/:userId', asyncHandler(unblockUser));
router.post('/report', validateBody({
  reportedUserId: { required: true, type: 'string' },
  reason: { required: true, enum: ['fake-profile', 'harassment', 'spam', 'inappropriate-content', 'other'] },
}), asyncHandler(reportAndOptionallyBlock));
router.get('/check-ins', asyncHandler(listCheckIns));
router.post('/check-ins', validateBody({ scheduledFor: { required: true, type: 'string' }, venue: { required: true, type: 'string' } }), asyncHandler(createCheckIn));
router.put('/check-ins/:id', validateBody({ status: { required: true, enum: ['safe', 'needs-help', 'cancelled'] } }), asyncHandler(updateCheckIn));
router.get('/trust', asyncHandler(getMyTrust));
export default router;
