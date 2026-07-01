import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { forgotPassword, login, register, resetPassword, refreshSession, logoutSession, listSessions, revokeSessionById } from '../controllers/auth.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import asyncHandler from '../utils/asyncHandler.js';

const router = Router();
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 50,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { success: false, message: 'Too many attempts. Please try again later.' },
});

router.use(authLimiter);
router.post('/register', asyncHandler(register));
router.post('/login', asyncHandler(login));
router.post('/forgot-password', asyncHandler(forgotPassword));
router.post('/reset-password', asyncHandler(resetPassword));
router.post('/refresh', asyncHandler(refreshSession));
router.post('/logout', asyncHandler(logoutSession));
router.get('/sessions', protect, asyncHandler(listSessions));
router.delete('/sessions/:id', protect, asyncHandler(revokeSessionById));

export default router;
