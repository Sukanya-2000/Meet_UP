import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { forgotPassword, login, register } from '../controllers/auth.controller.js';
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

export default router;
