import Stripe from 'stripe';
import Subscription from '../models/Subscription.js';
import User from '../models/User.js';

const getStripe = () => {
  if (!process.env.STRIPE_SECRET_KEY) {
    const error = new Error('STRIPE_SECRET_KEY is not configured');
    error.statusCode = 500;
    throw error;
  }
  return new Stripe(process.env.STRIPE_SECRET_KEY);
};

const applySubscriptionState = async ({ userId, stripeCustomerId, stripeSubscriptionId, status, periodStart, periodEnd }) => {
  const active = ['active', 'trialing'].includes(status);
  const normalizedStatus = active ? 'active' : status === 'canceled' ? 'cancelled' : ['pending', 'cancelled', 'expired', 'inactive'].includes(status) ? status : 'inactive';
  const subscription = await Subscription.findOneAndUpdate(
    userId ? { userId } : { stripeSubscriptionId },
    {
      ...(userId ? { userId } : {}),
      plan: 'premium',
      status: normalizedStatus,
      provider: 'stripe',
      providerSubscriptionId: stripeSubscriptionId,
      stripeCustomerId,
      stripeSubscriptionId,
      startDate: periodStart ? new Date(periodStart * 1000) : new Date(),
      endDate: periodEnd ? new Date(periodEnd * 1000) : null,
      currentPeriodStart: periodStart ? new Date(periodStart * 1000) : new Date(),
      currentPeriodEnd: periodEnd ? new Date(periodEnd * 1000) : null,
      boostsRemaining: active ? 3 : 0,
    },
    { upsert: true, new: true, runValidators: true },
  );
  await User.findByIdAndUpdate(subscription.userId, { isPremium: active });
  return subscription;
};

export const createCheckoutSession = async (req, res) => {
  const stripe = getStripe();
  const baseUrl = process.env.CLIENT_URL?.split(',')[0] || 'http://localhost:5173';
  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    payment_method_types: ['card'],
    customer_email: req.user.email,
    client_reference_id: String(req.user._id),
    metadata: { userId: String(req.user._id), plan: 'premium' },
    subscription_data: { metadata: { userId: String(req.user._id), plan: 'premium' } },
    line_items: [{
      quantity: 1,
      price_data: {
        currency: 'usd',
        recurring: { interval: 'month' },
        unit_amount: 999,
        product_data: {
          name: 'CyberNest Monthly Premium',
          description: 'Unlimited Likes, Likes You, Advanced Filters, Verified Only Mode, and Profile Boost.',
        },
      },
    }],
    success_url: `${baseUrl}/premium?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${baseUrl}/premium?checkout=cancelled`,
  });

  console.info('STRIPE_SESSION_CREATED', { userId: String(req.user._id), sessionId: session.id });

  await Subscription.findOneAndUpdate(
    { userId: req.user._id },
    {
      userId: req.user._id,
      plan: 'premium',
      status: 'pending',
      provider: 'stripe',
      stripeCheckoutSessionId: session.id,
      stripeCustomerId: typeof session.customer === 'string' ? session.customer : null,
    },
    { upsert: true, new: true, runValidators: true },
  );

  res.status(201).json({ success: true, sessionId: session.id, checkoutUrl: session.url, publishableKey: process.env.STRIPE_PUBLISHABLE_KEY || '' });
};

export const confirmCheckoutSession = async (req, res) => {
  const stripe = getStripe();
  const session = await stripe.checkout.sessions.retrieve(req.params.sessionId, {
    expand: ['subscription'],
  });

  if (String(session.metadata?.userId || session.client_reference_id) !== String(req.user._id)) {
    res.status(403);
    throw new Error('This checkout session does not belong to your account');
  }

  if (session.payment_status !== 'paid' || session.status !== 'complete') {
    const subscription = await Subscription.findOne({ userId: req.user._id });
    return res.json({
      success: true,
      active: false,
      message: 'Checkout is not complete yet',
      subscription,
    });
  }

  const stripeSubscription = typeof session.subscription === 'string'
    ? await stripe.subscriptions.retrieve(session.subscription)
    : session.subscription;

  const subscription = await applySubscriptionState({
    userId: req.user._id,
    stripeCustomerId: session.customer,
    stripeSubscriptionId: stripeSubscription.id,
    status: stripeSubscription.status,
    periodStart: stripeSubscription.current_period_start,
    periodEnd: stripeSubscription.current_period_end,
  });

  subscription.stripeCheckoutSessionId = session.id;
  await subscription.save();

  res.json({
    success: true,
    active: subscription.status === 'active',
    message: subscription.status === 'active' ? 'Premium subscription activated' : 'Subscription saved',
    subscription,
  });
};

export const stripeWebhook = async (req, res) => {
  const stripe = getStripe();
  const signature = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  let event = req.body;

  try {
    if (webhookSecret) event = stripe.webhooks.constructEvent(req.body, signature, webhookSecret);
  } catch (error) {
    res.status(400);
    throw new Error(`Stripe webhook verification failed: ${error.message}`);
  }

  console.info('STRIPE_WEBHOOK_RECEIVED', { type: event.type });

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    if (session.mode === 'subscription') {
      const stripeSubscription = await stripe.subscriptions.retrieve(session.subscription);
      await applySubscriptionState({
        userId: session.metadata?.userId || session.client_reference_id,
        stripeCustomerId: session.customer,
        stripeSubscriptionId: stripeSubscription.id,
        status: stripeSubscription.status,
        periodStart: stripeSubscription.current_period_start,
        periodEnd: stripeSubscription.current_period_end,
      });
    }
  }

  if (event.type === 'invoice.paid') {
    const invoice = event.data.object;
    if (invoice.subscription) {
      const stripeSubscription = await stripe.subscriptions.retrieve(invoice.subscription);
      const existing = await Subscription.findOne({ stripeSubscriptionId: stripeSubscription.id });
      await applySubscriptionState({
        userId: existing?.userId,
        stripeCustomerId: stripeSubscription.customer,
        stripeSubscriptionId: stripeSubscription.id,
        status: stripeSubscription.status,
        periodStart: stripeSubscription.current_period_start,
        periodEnd: stripeSubscription.current_period_end,
      });
    }
  }

  if (event.type === 'customer.subscription.deleted') {
    const stripeSubscription = event.data.object;
    const subscription = await Subscription.findOneAndUpdate(
      { stripeSubscriptionId: stripeSubscription.id },
      { status: 'cancelled', endDate: new Date(), currentPeriodEnd: new Date() },
      { new: true },
    );
    if (subscription) await User.findByIdAndUpdate(subscription.userId, { isPremium: false });
  }

  res.json({ received: true });
};
