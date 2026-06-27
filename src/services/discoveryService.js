import api from './api';

const getDiscovery = async (page = 1, limit = 10, filters = {}) =>
  (await api.get('/discovery', { params: { page, limit, ...filters } })).data;
const swipe = async (toUser, action) => (await api.post('/swipe', { toUser, action })).data;
const rewind = async () => (await api.delete('/swipe/rewind')).data;

export default { getDiscovery, swipe, rewind };
