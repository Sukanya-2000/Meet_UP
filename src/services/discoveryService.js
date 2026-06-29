import api from './api';

const normalizeFilters = (filters = {}) => Object.fromEntries(
  Object.entries(filters).map(([key, value]) => [key, Array.isArray(value) ? value.join(',') : value]),
);

const getDiscovery = async (page = 1, limit = 10, filters = {}) =>
  (await api.get('/discovery', { params: { page, limit, ...normalizeFilters(filters) } })).data;
const swipe = async (toUser, action) => (await api.post('/swipe', { toUser, action })).data;
const rewind = async () => (await api.delete('/swipe/rewind')).data;

export default { getDiscovery, swipe, rewind };
