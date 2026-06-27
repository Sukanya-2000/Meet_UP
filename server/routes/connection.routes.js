import { Router } from 'express';
import { listRequests, respondRequest, sendRequest } from '../controllers/connection.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import asyncHandler from '../utils/asyncHandler.js';

const router = Router();
router.use(protect);
router.get('/', asyncHandler(listRequests));
router.post('/', asyncHandler(sendRequest));
router.put('/:id', asyncHandler(respondRequest));

export default router;
