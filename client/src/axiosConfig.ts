import axios from 'axios';

const instance = axios.create({
  baseURL: 'http://localhost:6969/api', // replace with your server's URL
  withCredentials: true,
});

export default instance;