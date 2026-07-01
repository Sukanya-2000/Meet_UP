import Profile from '../models/Profile.js';
import Subscription from '../models/Subscription.js';

export const getMySubscription = async (req, res) => {
  const [subscription, profile] = await Promise.all([
    Subscription.findOne({ userId: req.user._id }).lean(),
    Profile.findOne({ userId: req.user._id }).select('boostedUntil').lean(),
  ]);
  res.json({
    success: true,
    subscription: {
      ...(subscription || { plan: 'free', status: 'inactive', boostsRemaining: 0 }),
      boostedUntil: profile?.boostedUntil || null,
    },
  });
};
