import { Router } from 'express';
import { acceptLike, getReceivedLikes, getSentLikes, passLike } from '../controllers/likes.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import asyncHandler from '../utils/asyncHandler.js';

const router = Router();
router.use(protect);
router.get('/received', asyncHandler(getReceivedLikes));
router.get('/sent', asyncHandler(getSentLikes));
router.post('/accept/:likeId', asyncHandler(acceptLike));
router.post('/pass/:likeId', asyncHandler(passLike));
export default router;
