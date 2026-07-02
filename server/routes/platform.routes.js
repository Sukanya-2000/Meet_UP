import { Router } from 'express';
import { protect } from '../middleware/auth.middleware.js';
import { adminOnly } from '../middleware/admin.middleware.js';
import asyncHandler from '../utils/asyncHandler.js';
import { analytics, campusDiscover, campusInstitutionSearch, campusJoin, campusOverview, clearCache, disconnectMusic, exportAnalytics, mediaSign, musicProfile, ops, spotifyCallback, spotifyStart, track, institutions, saveInstitution, verifyCampus, moderateEvent, pendingEvents, flags, saveFlag } from '../controllers/platform.controller.js';

const router = Router();

router.get('/music/spotify/callback', asyncHandler(spotifyCallback));
router.post('/music/spotify/callback', asyncHandler(spotifyCallback));
router.use(protect);
router.get('/music/spotify/start', asyncHandler(spotifyStart));
router.delete('/music', asyncHandler(disconnectMusic));
router.get('/music', asyncHandler(musicProfile));
router.get('/campus/institutions', asyncHandler(campusInstitutionSearch));
router.get('/campus', asyncHandler(campusOverview));
router.post('/campus/join', asyncHandler(campusJoin));
router.get('/campus/discovery', asyncHandler(campusDiscover));
router.post('/media/sign', asyncHandler(mediaSign));
router.post('/analytics/track', asyncHandler(track));
router.get('/admin/analytics', adminOnly, asyncHandler(analytics));
router.get('/admin/analytics/export', adminOnly, asyncHandler(exportAnalytics));
router.get('/admin/ops', adminOnly, asyncHandler(ops));
router.delete('/admin/cache', adminOnly, asyncHandler(clearCache));
router.get('/admin/institutions', adminOnly, asyncHandler(institutions));
router.post('/admin/institutions', adminOnly, asyncHandler(saveInstitution));
router.put('/admin/institutions/:id', adminOnly, asyncHandler(saveInstitution));
router.put('/admin/campus/:id', adminOnly, asyncHandler(verifyCampus));
router.get('/admin/events', adminOnly, asyncHandler(pendingEvents));
router.put('/admin/events/:id', adminOnly, asyncHandler(moderateEvent));
router.get('/admin/flags', adminOnly, asyncHandler(flags));
router.put('/admin/flags/:key', adminOnly, asyncHandler(saveFlag));

export default router;
