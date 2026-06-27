import api from './api';

const received = async () => (await api.get('/likes/received')).data;
const sent = async () => (await api.get('/likes/sent')).data;
const accept = async (likeId) => (await api.post(`/likes/accept/${likeId}`)).data;
const pass = async (likeId) => (await api.post(`/likes/pass/${likeId}`)).data;

export default { received, sent, accept, pass };
