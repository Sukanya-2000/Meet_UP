import Notification from '../models/Notification.js';
import Profile from '../models/Profile.js';
import Subscription from '../models/Subscription.js';
import { paymentProvider } from '../services/payment.service.js';

export const createSubscription = async (req, res) => {
  const plan = req.body.plan || 'premium';
  if (plan !== 'premium') {
    res.status(400);
    throw new Error('Only the premium plan is available');
  }
  const payment = await paymentProvider.createSubscription({ userId: req.user._id, plan });
  const subscription = await Subscription.findOneAndUpdate(
    { userId: req.user._id },
    {
      userId: req.user._id,
      plan,
      status: payment.status,
      provider: payment.provider,
      providerSubscriptionId: payment.providerSubscriptionId,
    },
    { upsert: true, new: true, runValidators: true },
  );
  res.status(201).json({
    success: true,
    message: 'Mock subscription created. No payment was charged.',
    subscription,
    checkoutUrl: payment.checkoutUrl,
  });
};

export const subscriptionWebhook = async (req, res) => {
  let event;
  try {
    event = paymentProvider.verifyWebhook(req.body, req.headers['x-mock-signature']);
  } catch (error) {
    res.status(401);
    throw error;
  }
  const subscription = await Subscription.findOne({ providerSubscriptionId: event.providerSubscriptionId });
  if (!subscription) {
    res.status(404);
    throw new Error('Subscription not found');
  }
  subscription.status = event.status;
  if (event.status === 'active') {
    subscription.plan = 'premium';
    subscription.currentPeriodStart = new Date();
    subscription.currentPeriodEnd = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    subscription.boostsRemaining = Math.max(subscription.boostsRemaining, 3);
  }
  await subscription.save();
  await Notification.create({
    userId: subscription.userId,
    type: 'subscription',
    title: 'Subscription updated',
    body: `Your premium subscription is now ${subscription.status}.`,
  });
  res.json({ success: true, subscription });
};

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
