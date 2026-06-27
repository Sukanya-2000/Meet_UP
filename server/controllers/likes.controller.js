import Block from '../models/Block.js';
import Like from '../models/Like.js';
import Photo from '../models/Photo.js';
import Profile from '../models/Profile.js';
import { createMatchIfMutual } from '../services/match-engine.service.js';

export const getReceivedLikes = async (req, res) => {
  const blocks = await Block.find({
    $or: [{ blockerId: req.user._id }, { blockedUserId: req.user._id }],
  }).lean();
  const blockedIds = blocks.map((block) =>
    String(block.blockerId) === String(req.user._id) ? block.blockedUserId : block.blockerId);

  const likes = await Like.find({
    toUser: req.user._id,
    status: 'pending',
    fromUser: { $nin: blockedIds },
  }).sort({ createdAt: -1 });
  const userIds = likes.map((like) => like.fromUser);
  const [profiles, photos] = await Promise.all([
    Profile.find({ userId: { $in: userIds } }).lean(),
    Photo.find({ userId: { $in: userIds } }).sort({ isMain: -1, orderIndex: 1 }).lean(),
  ]);
  const data = likes.map((like) => {
    const profile = profiles.find((item) => String(item.userId) === String(like.fromUser));
    const photo = photos.find((item) => String(item.userId) === String(like.fromUser));
    return {
      likeId: like._id,
      userId: like.fromUser,
      profile: profile ? { ...profile, photo } : null,
    };
  }).filter((item) => item.profile);
  res.json(data);
};

export const getSentLikes = async (req, res) => {
  const blocks = await Block.find({ $or: [{ blockerId: req.user._id }, { blockedUserId: req.user._id }] }).lean();
  const blockedIds = blocks.map((block) => String(block.blockerId) === String(req.user._id) ? block.blockedUserId : block.blockerId);
  const likes = await Like.find({
    fromUser: req.user._id,
    status: { $in: ['pending', 'accepted'] },
    toUser: { $nin: blockedIds },
  }).sort({ updatedAt: -1 });
  const userIds = likes.map((like) => like.toUser);
  const [profiles, photos] = await Promise.all([
    Profile.find({ userId: { $in: userIds } }).lean(),
    Photo.find({ userId: { $in: userIds } }).sort({ isMain: -1, orderIndex: 1 }).lean(),
  ]);
  res.json(likes.map((like) => {
    const profile = profiles.find((item) => String(item.userId) === String(like.toUser));
    const photo = photos.find((item) => String(item.userId) === String(like.toUser));
    return { likeId: like._id, userId: like.toUser, status: like.status, likedAt: like.updatedAt, profile: profile ? { ...profile, photo } : null };
  }).filter((item) => item.profile));
};

export const acceptLike = async (req, res) => {
  const incoming = await Like.findOne({
    _id: req.params.likeId,
    toUser: req.user._id,
    status: 'pending',
  });
  if (!incoming) {
    res.status(404);
    throw new Error('Incoming like not found');
  }

  const reciprocal = await Like.findOneAndUpdate(
    { fromUser: req.user._id, toUser: incoming.fromUser },
    { fromUser: req.user._id, toUser: incoming.fromUser, status: 'accepted' },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  );
  console.info('LIKE_CREATED', {
    likeId: String(reciprocal._id),
    fromUser: String(req.user._id),
    toUser: String(incoming.fromUser),
    source: 'accept',
  });
  incoming.status = 'accepted';
  await incoming.save();
  const result = await createMatchIfMutual({
    fromUser: req.user._id,
    toUser: incoming.fromUser,
    forceMutual: true,
  });
  res.json({
    success: true,
    matchId: result.match._id,
    conversationId: result.conversation._id,
    match: result.celebration,
  });
};

export const passLike = async (req, res) => {
  const like = await Like.findOneAndUpdate(
    { _id: req.params.likeId, toUser: req.user._id, status: 'pending' },
    { status: 'passed' },
    { new: true },
  );
  if (!like) {
    res.status(404);
    throw new Error('Incoming like not found');
  }
  res.json({ success: true, message: 'Like passed' });
};
