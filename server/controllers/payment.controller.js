import Stripe from 'stripe';
import Subscription from '../models/Subscription.js';
import User from '../models/User.js';
import PurchaseReceipt from '../models/PurchaseReceipt.js';
import { listEntitlements, syncPremiumEntitlements } from '../services/entitlement.service.js';

const getStripe = () => {
  if (!process.env.STRIPE_SECRET_KEY) {
    const error = new Error('STRIPE_SECRET_KEY is not configured');
    error.statusCode = 500;
    throw error;
  }
  return new Stripe(process.env.STRIPE_SECRET_KEY);
};

const applySubscriptionState = async ({ userId, stripeCustomerId, stripeSubscriptionId, status, periodStart, periodEnd, plan = 'premium' }) => {
  const active = ['active', 'trialing'].includes(status);
  const normalizedStatus = active ? 'active' : status === 'canceled' ? 'cancelled' : ['pending', 'cancelled', 'expired', 'inactive'].includes(status) ? status : 'inactive';
  const subscription = await Subscription.findOneAndUpdate(
    userId ? { userId } : { stripeSubscriptionId },
    {
      ...(userId ? { userId } : {}),
      plan,
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
  await syncPremiumEntitlements({ userId: subscription.userId, source: 'stripe', active, plan, expiresAt: subscription.currentPeriodEnd, metadata: { subscriptionId: stripeSubscriptionId } });
  return subscription;
};

export const getEntitlements = async (req, res) => res.json({ success: true, entitlements: await listEntitlements(req.user._id) });

export const verifyStorePurchase = async (req, res) => {
  const { provider, receipt, productId, transactionId } = req.body;
  if (!['apple', 'google'].includes(provider) || !receipt || !productId || !transactionId) { res.status(400); throw new Error('Complete store purchase details are required'); }
  const verificationUrl = provider === 'apple' ? process.env.APPLE_RECEIPT_VERIFICATION_URL : process.env.GOOGLE_RECEIPT_VERIFICATION_URL;
  if (!verificationUrl) { res.status(503); throw new Error(`${provider} receipt verification is not configured`); }
  const response = await fetch(verificationUrl, { method: 'POST', headers: { 'content-type': 'application/json', authorization: `Bearer ${provider === 'apple' ? process.env.APPLE_RECEIPT_SECRET : process.env.GOOGLE_SERVICE_TOKEN}` }, body: JSON.stringify({ receipt, productId, transactionId }) });
  if (!response.ok) { res.status(400); throw new Error('Store receipt could not be verified'); }
  const verified = await response.json();
  if (!verified.valid) { res.status(400); throw new Error('Store receipt is invalid'); }
  const expiresAt = verified.expiresAt ? new Date(verified.expiresAt) : null;
  await PurchaseReceipt.findOneAndUpdate({ provider, transactionId }, { userId: req.user._id, provider, transactionId, productId, receipt, status: 'active', expiresAt }, { upsert: true, new: true, runValidators: true });
  await syncPremiumEntitlements({ userId: req.user._id, source: provider, active: true, expiresAt, metadata: { transactionId, productId } });
  await User.findByIdAndUpdate(req.user._id, { isPremium: true });
  res.json({ success: true, entitlements: await listEntitlements(req.user._id) });
};

export const createCheckoutSession = async (req, res) => {
  const stripe = getStripe();
  const plan = ['plus','gold','platinum'].includes(req.body.plan) ? req.body.plan : 'gold';
  const baseUrl = process.env.CLIENT_URL?.split(',')[0] || 'http://localhost:5173';
  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    payment_method_types: ['card'],
    customer_email: req.user.email,
    client_reference_id: String(req.user._id),
    metadata: { userId: String(req.user._id), plan },
    subscription_data: { metadata: { userId: String(req.user._id), plan } },
    line_items: [{
      quantity: 1,
      price_data: {
        currency: 'usd',
        recurring: { interval: 'month' },
        unit_amount: plan === 'plus' ? 699 : plan === 'platinum' ? 1499 : 999,
        product_data: {
          name: `CyberNest ${plan[0].toUpperCase()}${plan.slice(1)} Monthly`,
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
      plan,
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
    plan: session.metadata?.plan || 'premium',
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
  if (!webhookSecret) { res.status(503); throw new Error('Stripe webhook verification is not configured'); }
  let event = req.body;

  try {
    event = stripe.webhooks.constructEvent(req.body, signature, webhookSecret);
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
        plan: session.metadata?.plan || stripeSubscription.metadata?.plan || 'premium',
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
