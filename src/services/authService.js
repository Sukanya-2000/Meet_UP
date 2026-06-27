import api from './api';

const register = async (data) => (await api.post('/auth/register', data)).data;
const login = async (data) => (await api.post('/auth/login', data)).data;
const forgotPassword = async (data) => (await api.post('/auth/forgot-password', data)).data;

export default { register, login, forgotPassword };
