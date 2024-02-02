import axios from 'axios';

const instance = axios.create({
  baseURL: 'http://localhost:6969/api', // replace with your server's URL
});

export default instance;