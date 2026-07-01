import Like from '../models/Like.js';
import Profile from '../models/Profile.js';
import { isPremium } from '../services/subscription.service.js';
import Block from '../models/Block.js';
import { createMatchIfMutual } from '../services/match-engine.service.js';
import Notification from '../models/Notification.js';
import ConsumableBalance from '../models/ConsumableBalance.js';
import { hasEntitlement } from '../services/entitlement.service.js';

export const createLike = async (req, res) => {
  const { toUser, kind = 'like' } = req.body;
  const note = String(req.body.note || '').trim();
  if (!['like', 'super-like'].includes(kind) || note.length > 280) { res.status(400); throw new Error('Invalid like type or note'); }
  if (!toUser || String(toUser) === String(req.user._id)) {
    res.status(400);
    throw new Error('Select a valid profile to like');
  }
  if (!(await Profile.exists({ userId: toUser }))) {
    res.status(404);
    throw new Error('Profile not found');
  }
  if (await Block.exists({
    $or: [
      { blockerId: req.user._id, blockedUserId: toUser },
      { blockerId: toUser, blockedUserId: req.user._id },
    ],
  })) {
    res.status(403);
    throw new Error('This profile is unavailable');
  }
  if (!(await isPremium(req.user._id))) {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const dailyLikes = await Like.countDocuments({ fromUser: req.user._id, createdAt: { $gte: startOfDay } });
    if (dailyLikes >= 20) {
      res.status(429);
      throw new Error('Daily like limit reached. Upgrade to Premium for unlimited likes.');
    }
  }
  if (kind === 'super-like' || note) {
    const entitlement = await hasEntitlement(req.user._id, kind === 'super-like' ? 'super_likes' : 'pre_match_notes');
    const today = new Date().toISOString().slice(0, 10);
    let balance = await ConsumableBalance.findOneAndUpdate({ userId: req.user._id, key: kind === 'super-like' ? 'super-like' : 'pre-match-note' }, { $setOnInsert: { balance: 0 } }, { upsert: true, new: true });
    if (balance.dailyWindow !== today) { balance.dailyWindow = today; balance.dailyUsed = 0; }
    if (!entitlement && balance.balance < 1) { res.status(403); throw new Error('This action requires an entitlement or consumable'); }
    if (entitlement && balance.dailyUsed >= 3) { res.status(429); throw new Error('Daily premium action quota reached'); }
    if (!entitlement) balance.balance -= 1; else balance.dailyUsed += 1;
    await balance.save();
  }

  const like = await Like.findOneAndUpdate(
    { fromUser: req.user._id, toUser },
    { fromUser: req.user._id, toUser, status: 'pending', kind, note },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  );
  console.info('LIKE_CREATED', { likeId: String(like._id), fromUser: String(req.user._id), toUser: String(toUser) });
  const result = await createMatchIfMutual({ fromUser: req.user._id, toUser });
  await Notification.create({ userId: toUser, type: 'like', title: kind === 'super-like' ? 'Someone sent you a Super Spark' : note ? 'Someone liked you with a note' : 'Someone liked you', body: note || 'Open CyberNest to see who noticed you.', data: { likeId: like._id, kind }, deepLink: '/liked-you' });

  res.status(201).json({
    success: true,
    message: result.matched ? "It's a match!" : 'Like sent',
    matched: result.matched,
    isNewMatch: result.isNewMatch,
    match: result.celebration || null,
    conversationId: result.conversation?._id || null,
    like,
  });
};
