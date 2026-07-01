import api from './api';

const dashboard = async () => (await api.get('/admin/dashboard')).data;
const users = async () => (await api.get('/admin/users')).data;
const updateUserStatus = async (id, accountStatus) => (await api.put(`/admin/users/${id}/status`, { accountStatus })).data;
const managePremium = async (id, status) => (await api.put(`/admin/users/${id}/premium`, { status })).data;
const reports = async () => (await api.get('/admin/reports')).data;
const updateReport = async (id, status) => (await api.put(`/admin/reports/${id}`, { status })).data;
const verifications = async () => (await api.get('/admin/verifications')).data;
const reviewVerification = async (id, status) => (await api.put(`/admin/verifications/${id}`, { status })).data;
const prompts = async () => (await api.get('/admin/profile-prompts')).data;
const moderatePrompt = async (id, status, note = '') => (await api.put(`/admin/profile-prompts/${id}`, { status, note })).data;
const settings = async () => (await api.get('/admin/settings')).data;
const updateSetting = async (key, value) => (await api.put(`/admin/settings/${key}`, { value })).data;
const openingMoves = async () => (await api.get('/admin/opening-moves')).data;
const moderateOpeningMove = async (id, status, note = '') => (await api.put(`/admin/opening-moves/${id}`, { status, note })).data;
const questions = async () => (await api.get('/admin/questions')).data;
const moderationQueue = async () => (await api.get('/admin/moderation-queue')).data;

export default { dashboard, users, updateUserStatus, managePremium, reports, updateReport, verifications, reviewVerification, prompts, moderatePrompt, settings, updateSetting, openingMoves, moderateOpeningMove, questions, moderationQueue };
