import api from './api';

const list = async () => (await api.get('/connections')).data;
const send = async (toUser) => (await api.post('/connections', { toUser })).data;
const respond = async (id, status) => (await api.put(`/connections/${id}`, { status })).data;

export default { list, send, respond };
