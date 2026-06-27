import { Router } from 'express';
import { createMessage, getConversations, getMessages, uploadMessageMedia } from '../controllers/message.controller.js';
import { uploadChatMedia } from '../config/upload.js';
import { protect } from '../middleware/auth.middleware.js';
import asyncHandler from '../utils/asyncHandler.js';

const router = Router();
router.get('/conversations/list', protect, asyncHandler(getConversations));
router.post('/media', protect, uploadChatMedia.array('media', 6), asyncHandler(uploadMessageMedia));
router.get('/:matchId', protect, asyncHandler(getMessages));
router.post('/', protect, asyncHandler(createMessage));
export default router;
