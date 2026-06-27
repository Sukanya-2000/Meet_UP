import Like from '../models/Like.js';
import Photo from '../models/Photo.js';
import Profile from '../models/Profile.js';
import Subscription from '../models/Subscription.js';

export const getLikesYou = async (req, res) => {
  const userIds = await Like.distinct('fromUser', { toUser: req.user._id });
  const [profiles, photos] = await Promise.all([
    Profile.find({ userId: { $in: userIds } }).lean(),
    Photo.find({ userId: { $in: userIds }, isMain: true }).lean(),
  ]);
  const likes = profiles.map((profile) => ({
    ...profile,
    photo: photos.find((photo) => String(photo.userId) === String(profile.userId)),
  }));
  res.json({ success: true, likes });
};

export const boostProfile = async (req, res) => {
  const subscription = await Subscription.findOne({ userId: req.user._id });
  if (!subscription?.boostsRemaining) {
    res.status(400);
    throw new Error('No profile boosts remaining');
  }
  const profile = await Profile.findOne({ userId: req.user._id });
  if (profile?.boostedUntil && profile.boostedUntil > new Date()) {
    res.status(429);
    throw new Error('Your profile is already boosted. You can boost again when the timer ends.');
  }
  const boostedUntil = new Date(Date.now() + 30 * 60 * 1000);
  await Promise.all([
    Profile.updateOne({ userId: req.user._id }, { boostedUntil }),
    Subscription.updateOne({ _id: subscription._id }, { $inc: { boostsRemaining: -1 } }),
  ]);
  res.json({
    success: true,
    message: 'Your profile is boosted for 30 minutes',
    boostedUntil,
    boostsRemaining: subscription.boostsRemaining - 1,
  });
};
