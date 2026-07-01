import api from './api';

const like = async (toUser) => (await api.post('/like', { toUser })).data;
const superLike = async (toUser, note = '') => (await api.post('/like', { toUser, kind: 'super-like', note })).data;
const getMatches = async () => (await api.get('/matches')).data;
const unmatch = async (id, reason = '') => (await api.delete(`/matches/${id}`, { data: { reason } })).data;

export default { like, superLike, getMatches, unmatch };
