import Subscription from '../models/Subscription.js';

export const requirePremium = async (req, res, next) => {
  const active = req.user?.isPremium || await Subscription.exists({
    userId: req.user._id,
    plan: 'premium',
    status: 'active',
    $or: [{ endDate: null }, { endDate: { $gt: new Date() } }, { currentPeriodEnd: { $gt: new Date() } }],
  });

  if (!active) {
    res.status(402);
    return next(new Error('Premium membership required'));
  }
  return next();
};
