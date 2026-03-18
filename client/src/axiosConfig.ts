import axios from 'axios';
import { clearAuthToken, getAuthToken } from '@utils/authToken';

export const baseApiUrl = import.meta.env.VITE_API_URL;

const instance = axios.create({
  baseURL: baseApiUrl, // replace with your server's URL
  withCredentials: true,
});

instance.interceptors.request.use((config) => {
  const token = getAuthToken();
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

instance.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle session expiry globally
    if (error.response?.status === 401) {
      clearAuthToken();
      // Redirect to home/login — use window.location for hard redirect
      // since we're outside React's router context
      window.location.href = '/';
      return Promise.reject(error);
    }

    const serverMsg =
      (error.response?.data as any)?.message ??
      (error.response?.data as any)?.error ??
      (typeof error.response?.data === 'string' ? error.response?.data : undefined);
    if (serverMsg) error.message = String(serverMsg);
    return Promise.reject(error);
  },
);
export default instance;
