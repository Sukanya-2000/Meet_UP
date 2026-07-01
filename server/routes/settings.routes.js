import { Router } from 'express';
import { getAppearance, updateAppearance } from '../controllers/settings.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = Router();
router.use(protect);
router.get('/appearance', getAppearance);
router.put('/appearance', updateAppearance);
export default router;
