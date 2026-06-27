import { Router } from 'express';
import { getPhotos, remove, reorder, setMain, upload } from '../controllers/photo.controller.js';
import { uploadPhotos } from '../config/upload.js';
import { protect } from '../middleware/auth.middleware.js';
import asyncHandler from '../utils/asyncHandler.js';

const router = Router();
router.use(protect);
router.get('/', asyncHandler(getPhotos));
router.post('/upload', uploadPhotos.array('photos', 6), asyncHandler(upload));
router.put('/main/:id', asyncHandler(setMain));
router.put('/reorder', asyncHandler(reorder));
router.delete('/:id', asyncHandler(remove));

export default router;
