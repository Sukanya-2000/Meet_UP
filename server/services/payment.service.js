import crypto from 'crypto';

class MockPaymentProvider {
  async createSubscription({ userId, plan }) {
    return {
      provider: 'mock',
      providerSubscriptionId: `mock_sub_${crypto.randomUUID()}`,
      status: 'pending',
      checkoutUrl: `/premium/mock-checkout?user=${userId}&plan=${plan}`,
    };
  }

  verifyWebhook(payload, signature) {
    const expected = process.env.MOCK_WEBHOOK_SECRET || 'cybernest_mock_webhook';
    if (signature !== expected) throw new Error('Invalid webhook signature');
    return payload;
  }
}

export const paymentProvider = new MockPaymentProvider();
