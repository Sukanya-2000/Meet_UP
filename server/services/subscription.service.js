import Subscription from '../models/Subscription.js';

export const getSubscription = async (userId) => {
  const subscription = await Subscription.findOne({ userId });
  if (!subscription) return { plan: 'free', status: 'inactive', boostsRemaining: 0 };
  if (subscription.status === 'active' && subscription.currentPeriodEnd && subscription.currentPeriodEnd < new Date()) {
    subscription.status = 'expired';
    await subscription.save();
  }
  return subscription;
};

export const isPremium = async (userId) => {
  const subscription = await getSubscription(userId);
  return subscription.plan === 'premium' && subscription.status === 'active';
};
