import api from './api';

const saveBasicProfile = async (data) => (await api.post('/profile/basic', data)).data;
const saveInterests = async (interests) => (await api.post('/profile/interests', { interests })).data;
const getMyProfile = async () => (await api.get('/profile/me')).data;
const updateProfile = async (data) => (await api.put('/profile/update', data)).data;
const getPrompts = async () => (await api.get('/profile/prompts')).data;
const savePrompt = async (data) => (await api.post('/profile/prompts', data)).data;
const deletePrompt = async (id) => (await api.delete(`/profile/prompts/${id}`)).data;
const updatePrivacy = async (data) => (await api.put('/profile/privacy', data)).data;
const updateTravel = async (data) => (await api.put('/profile/travel', data)).data;

export default { saveBasicProfile, saveInterests, getMyProfile, updateProfile, getPrompts, savePrompt, deletePrompt, updatePrivacy, updateTravel };
