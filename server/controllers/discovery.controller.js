import mongoose from 'mongoose';
import Photo from '../models/Photo.js';
import Profile from '../models/Profile.js';
import Swipe from '../models/Swipe.js';
import Like from '../models/Like.js';
import { isPremium } from '../services/subscription.service.js';
import Block from '../models/Block.js';
import { isUserOnline } from '../socket/index.js';

export const getDiscovery = async (req, res) => {
  const page = Math.max(Number.parseInt(req.query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(Number.parseInt(req.query.limit, 10) || 10, 1), 30);
  const premium = await isPremium(req.user._id);
  const ageMin = premium ? Math.max(Number(req.query.ageMin) || 18, 18) : 18;
  const ageMax = premium ? Math.min(Number(req.query.ageMax) || 100, 100) : 100;
  const verifiedOnly = premium && req.query.verifiedOnly === 'true';
  const gender = premium && ['man', 'woman', 'non-binary', 'other'].includes(req.query.gender) ? req.query.gender : null;
  const [swipedIds, likedIds, blocks] = await Promise.all([
    Swipe.distinct('toUser', { fromUser: req.user._id }),
    Like.distinct('toUser', { fromUser: req.user._id }),
    Block.find({ $or: [{ blockerId: req.user._id }, { blockedUserId: req.user._id }] }).lean(),
  ]);
  const blockedIds = blocks.map((block) =>
    String(block.blockerId) === String(req.user._id) ? block.blockedUserId : block.blockerId);
  const excluded = [...new Set([...swipedIds, ...likedIds, ...blockedIds, req.user._id].map(String))]
    .map((id) => new mongoose.Types.ObjectId(id));

  const today = new Date();
  const youngestDob = new Date(today.getFullYear() - ageMin, today.getMonth(), today.getDate());
  const oldestDob = new Date(today.getFullYear() - ageMax - 1, today.getMonth(), today.getDate() + 1);
  const baseMatch = {
    userId: { $nin: excluded },
    dob: { $gte: oldestDob, $lte: youngestDob },
    ...(verifiedOnly && { isVerified: true }),
    ...(gender && { gender }),
  };
  const [profiles, total] = await Promise.all([
    Profile.aggregate([
      { $match: baseMatch },
      { $lookup: { from: 'users', localField: 'userId', foreignField: '_id', as: 'user' } },
      { $unwind: '$user' },
      { $match: { 'user.accountStatus': 'active' } },
      { $addFields: { boostRank: { $cond: [{ $gt: ['$boostedUntil', new Date()] }, 1, 0] } } },
      { $sort: { boostRank: -1, updatedAt: -1 } },
      { $skip: (page - 1) * limit },
      { $limit: limit },
      { $project: { user: 0 } },
    ]),
    Profile.aggregate([
      { $match: baseMatch },
      { $lookup: { from: 'users', localField: 'userId', foreignField: '_id', as: 'user' } },
      { $unwind: '$user' },
      { $match: { 'user.accountStatus': 'active' } },
      { $count: 'count' },
    ]),
  ]);

  const photos = await Photo.find({ userId: { $in: profiles.map((profile) => profile.userId) } }).sort({ orderIndex: 1 });
  const data = profiles.map((profile) => ({
    ...profile,
    isOnline: isUserOnline(profile.userId),
    photos: photos.filter((photo) => photo.userId.equals(profile.userId)),
  }));

  res.json({
    success: true,
    profiles: data,
    pagination: { page, limit, total: total[0]?.count || 0, hasMore: page * limit < (total[0]?.count || 0) },
  });
};
