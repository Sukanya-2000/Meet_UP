import api from './api';

const block = async (blockedUserId, reason = '') => (await api.post('/safety/block', { blockedUserId, reason })).data;
const unblock = async (userId) => (await api.delete(`/safety/block/${userId}`)).data;
const blocked = async () => (await api.get('/safety/blocked')).data;
const report = async (data) => (await api.post('/safety/report', data)).data;
const getCheckIns = async () => (await api.get('/safety/check-ins')).data;
const createCheckIn = async (data) => (await api.post('/safety/check-ins', data)).data;
const updateCheckIn = async (id, status) => (await api.put(`/safety/check-ins/${id}`, { status })).data;
const getTrust = async () => (await api.get('/safety/trust')).data;

export default { block, unblock, blocked, report, getCheckIns, createCheckIn, updateCheckIn, getTrust };
