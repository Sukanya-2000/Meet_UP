import Entitlement from '../models/Entitlement.js';
const planKeys = { plus: ['unlimited_likes','incognito','travel_mode'], gold: ['unlimited_likes','incognito','travel_mode','likes_you','advanced_filters','verified_only','profile_boost','super_likes'], platinum: ['unlimited_likes','incognito','travel_mode','likes_you','advanced_filters','verified_only','profile_boost','super_likes','pre_match_notes','priority_likes'], premium: ['unlimited_likes','incognito','travel_mode','likes_you','advanced_filters','verified_only','profile_boost','super_likes','pre_match_notes','priority_likes'] };
export const syncPremiumEntitlements = async ({ userId, source, active, plan = 'premium', expiresAt = null, metadata = {} }) => {
  await Entitlement.updateMany({ userId, source }, { active: false });
  return Promise.all((planKeys[plan] || []).map((key) => Entitlement.findOneAndUpdate({ userId, key, source }, { userId, key, source, active, expiresAt, metadata: { ...metadata, plan } }, { upsert: true, new: true })));
};
export const listEntitlements = async (userId) => Entitlement.find({ userId, active: true, $or: [{ expiresAt: null }, { expiresAt: { $gt: new Date() } }] }).lean();
export const hasEntitlement = async (userId, key) => Boolean(await Entitlement.exists({ userId, key, active: true, $or: [{ expiresAt: null }, { expiresAt: { $gt: new Date() } }] }));
