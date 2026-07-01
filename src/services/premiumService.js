import api from './api';

const getSubscription = async () => (await api.get('/subscription/me')).data;
const createSubscription = async () => (await api.post('/subscription/create', { plan: 'premium' })).data;
const createCheckoutSession = async (plan = 'gold') => (await api.post('/payments/create-checkout-session', { plan })).data;
const confirmCheckoutSession = async (sessionId) => (await api.get(`/payments/checkout-session/${sessionId}/confirm`)).data;
const getLikesYou = async () => (await api.get('/premium/likes-you')).data;
const boost = async () => (await api.post('/premium/boost')).data;

export default { getSubscription, createSubscription, createCheckoutSession, confirmCheckoutSession, getLikesYou, boost };
