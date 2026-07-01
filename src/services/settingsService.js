import api from './api';
export const getAppearance = async () => (await api.get('/settings/appearance')).data;
export const updateAppearance = async (appearance) => (await api.put('/settings/appearance', appearance)).data;
