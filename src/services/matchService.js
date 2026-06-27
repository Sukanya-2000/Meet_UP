import api from './api';

const like = async (toUser) => (await api.post('/like', { toUser })).data;
const getMatches = async () => (await api.get('/matches')).data;

export default { like, getMatches };
