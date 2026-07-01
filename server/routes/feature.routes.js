import { Router } from 'express';
import {
  createDatePlan,
  createMatchmakerSession,
  getDoubleDateGroup,
  getMatchmakerSession,
  listDatePlans,
  saveDoubleDateGroup,
  updateDatePlan,
  getSharedDatePlan,
  transitionDatePlan,
} from '../controllers/feature.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import asyncHandler from '../utils/asyncHandler.js';

const router = Router();
router.get('/date-plans/shared/:token', asyncHandler(getSharedDatePlan));
router.use(protect);
router.route('/double-date').get(asyncHandler(getDoubleDateGroup)).put(asyncHandler(saveDoubleDateGroup));
router.route('/matchmaker').get(asyncHandler(getMatchmakerSession)).post(asyncHandler(createMatchmakerSession));
router.route('/date-plans').get(asyncHandler(listDatePlans)).post(asyncHandler(createDatePlan));
router.patch('/date-plans/:id', asyncHandler(updateDatePlan));
router.post('/date-plans/:id/status', asyncHandler(transitionDatePlan));

export default router;
