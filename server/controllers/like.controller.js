import Like from '../models/Like.js';
import Profile from '../models/Profile.js';
import { isPremium } from '../services/subscription.service.js';
import Block from '../models/Block.js';
import { createMatchIfMutual } from '../services/match-engine.service.js';

export const createLike = async (req, res) => {
  const { toUser } = req.body;
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

  const like = await Like.findOneAndUpdate(
    { fromUser: req.user._id, toUser },
    { fromUser: req.user._id, toUser, status: 'pending' },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  );
  console.info('LIKE_CREATED', { likeId: String(like._id), fromUser: String(req.user._id), toUser: String(toUser) });
  const result = await createMatchIfMutual({ fromUser: req.user._id, toUser });

  res.status(201).json({
    success: true,
    message: result.matched ? "It's a match!" : 'Like sent',
    matched: result.matched,
    isNewMatch: result.isNewMatch,
    match: result.celebration || null,
    conversationId: result.conversation?._id || null,
  });
};
