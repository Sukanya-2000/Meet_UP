import api from './api';

const dashboard = async () => (await api.get('/admin/dashboard')).data;
const users = async () => (await api.get('/admin/users')).data;
const updateUserStatus = async (id, accountStatus) => (await api.put(`/admin/users/${id}/status`, { accountStatus })).data;
const managePremium = async (id, status) => (await api.put(`/admin/users/${id}/premium`, { status })).data;
const reports = async () => (await api.get('/admin/reports')).data;
const updateReport = async (id, status) => (await api.put(`/admin/reports/${id}`, { status })).data;
const verifications = async () => (await api.get('/admin/verifications')).data;
const reviewVerification = async (id, status) => (await api.put(`/admin/verifications/${id}`, { status })).data;

export default { dashboard, users, updateUserStatus, managePremium, reports, updateReport, verifications, reviewVerification };
