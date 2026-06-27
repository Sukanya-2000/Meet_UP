import api from './api';

const getMessages = async (matchId) => (await api.get(`/messages/${matchId}`)).data;
const sendMessage = async (data) => (await api.post('/messages', data)).data;
const uploadMedia = async (data) => (await api.post('/messages/media', data)).data;

export default { getMessages, sendMessage, uploadMedia };
