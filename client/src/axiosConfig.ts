import axios from 'axios';

export const baseApiUrl = 'http://localhost:6969/api'; // replace with your server's URL

const instance = axios.create({
  baseURL: baseApiUrl, // replace with your server's URL
  withCredentials: true,
});

export default instance;