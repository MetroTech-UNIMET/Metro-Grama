import axios from 'axios';

export const baseApiUrl = import.meta.env.VITE_API_URL;

const instance = axios.create({
  baseURL: baseApiUrl, // replace with your server's URL
  withCredentials: true,
});

instance.interceptors.response.use(
  (response) => response,
  (error) => {
    const serverMsg =
      (error.response?.data as any)?.message ??
      (error.response?.data as any)?.error ??
      (typeof error.response?.data === 'string' ? error.response?.data : undefined);
    if (serverMsg) error.message = String(serverMsg);
    return Promise.reject(error);
  },
);

export default instance;
