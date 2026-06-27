import api from './api';

const saveBasicProfile = async (data) => (await api.post('/profile/basic', data)).data;
const saveInterests = async (interests) => (await api.post('/profile/interests', { interests })).data;
const getMyProfile = async () => (await api.get('/profile/me')).data;
const updateProfile = async (data) => (await api.put('/profile/update', data)).data;

export default { saveBasicProfile, saveInterests, getMyProfile, updateProfile };
