import api from './api';
export const getNotifications = async () => (await api.get('/notifications')).data;
export const markAllRead = async () => (await api.put('/notifications/read-all')).data;
export const getNotificationPreferences = async () => (await api.get('/notifications/settings/preferences')).data;
export const updateNotificationPreferences = async (preferences) => (await api.put('/notifications/settings/preferences', preferences)).data;
