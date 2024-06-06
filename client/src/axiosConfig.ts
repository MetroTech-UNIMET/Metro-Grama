import axios from 'axios';

export const baseApiUrl = import.meta.env.VITE_API_URL;

const instance = axios.create({
  baseURL: baseApiUrl, // replace with your server's URL
  withCredentials: true,
});

export default instance;