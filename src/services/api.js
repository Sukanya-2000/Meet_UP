import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('cybernest_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  if (config.data instanceof FormData) {
    delete config.headers['Content-Type'];
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    const refreshToken = localStorage.getItem('cybernest_refresh_token');
    if (error.response?.status === 401 && refreshToken && !original?._retried && !original?.url?.includes('/auth/refresh')) {
      original._retried = true;
      try {
        const response = await axios.post(`${api.defaults.baseURL}/auth/refresh`, { refreshToken, deviceName: navigator.userAgent });
        localStorage.setItem('cybernest_token', response.data.token);
        localStorage.setItem('cybernest_refresh_token', response.data.refreshToken);
        original.headers.Authorization = `Bearer ${response.data.token}`;
        return api(original);
      } catch { /* Fall through to a clean logout. */ }
    }
    if (error.response?.status === 401) {
      localStorage.removeItem('cybernest_token');
      localStorage.removeItem('cybernest_user');
      localStorage.removeItem('cybernest_refresh_token');
    }
    return Promise.reject(error);
  },
);

export default api;
