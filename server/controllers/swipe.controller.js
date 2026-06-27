import Profile from '../models/Profile.js';
import Swipe from '../models/Swipe.js';
import Like from '../models/Like.js';
import { createMatchIfMutual } from '../services/match-engine.service.js';

export const createSwipe = async (req, res) => {
  const { toUser, action } = req.body;
  if (!toUser || !['pass', 'like', 'favorite'].includes(action)) {
    res.status(400);
    throw new Error('A valid user and swipe action are required');
  }
  if (String(toUser) === String(req.user._id)) {
    res.status(400);
    throw new Error('You cannot swipe on your own profile');
  }
  if (!(await Profile.exists({ userId: toUser }))) {
    res.status(404);
    throw new Error('Profile not found');
  }

  const swipe = await Swipe.findOneAndUpdate(
    { fromUser: req.user._id, toUser },
    { action },
    { upsert: true, new: true, runValidators: true },
  );
  if (action === 'like') {
    const like = await Like.findOneAndUpdate(
      { fromUser: req.user._id, toUser },
      { fromUser: req.user._id, toUser, status: 'pending' },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );
    console.info('LIKE_CREATED', { likeId: String(like._id), fromUser: String(req.user._id), toUser: String(toUser), source: 'swipe' });
    const result = await createMatchIfMutual({ fromUser: req.user._id, toUser });
    return res.status(201).json({
      success: true,
      message: result.matched ? "It's a match!" : 'Like recorded',
      swipe,
      matched: result.matched,
      isNewMatch: result.isNewMatch,
      match: result.celebration || null,
      conversationId: result.conversation?._id || null,
    });
  }
  return res.status(201).json({ success: true, message: 'Swipe recorded', swipe, matched: false });
};

export const rewindSwipe = async (req, res) => {
  const swipe = await Swipe.findOneAndDelete({ fromUser: req.user._id }, { sort: { createdAt: -1 } });
  if (!swipe) {
    res.status(404);
    throw new Error('There is no swipe to rewind');
  }
  res.json({ success: true, message: 'Last swipe rewound', swipe });
};
