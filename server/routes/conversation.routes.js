import express from 'express';
import { getConversations } from '../controllers/message.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import asyncHandler from '../utils/asyncHandler.js';

const router = express.Router();

router.get('/', protect, asyncHandler(getConversations));

export default router;
