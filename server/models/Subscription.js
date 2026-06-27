import mongoose from 'mongoose';

const subscriptionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true, index: true },
  plan: { type: String, enum: ['free', 'premium'], default: 'free' },
  status: { type: String, enum: ['inactive', 'pending', 'active', 'cancelled', 'expired'], default: 'inactive' },
  provider: { type: String, default: 'mock' },
  providerSubscriptionId: { type: String, default: null },
  stripeCustomerId: { type: String, default: null, index: true },
  stripeSubscriptionId: { type: String, default: null, index: true },
  stripeCheckoutSessionId: { type: String, default: null, index: true },
  startDate: { type: Date, default: null },
  endDate: { type: Date, default: null },
  currentPeriodStart: { type: Date, default: null },
  currentPeriodEnd: { type: Date, default: null },
  boostsRemaining: { type: Number, min: 0, default: 0 },
}, { timestamps: true });

export default mongoose.model('Subscription', subscriptionSchema);
