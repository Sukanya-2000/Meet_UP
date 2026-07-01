import { Router } from 'express';
import { getCuratedDiscovery, getDiscovery } from '../controllers/discovery.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import asyncHandler from '../utils/asyncHandler.js';

const router = Router();
router.get('/', protect, asyncHandler(getDiscovery));
router.get('/curated', protect, asyncHandler(getCuratedDiscovery));
export default router;
