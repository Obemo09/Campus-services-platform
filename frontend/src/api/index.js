import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  const userId = localStorage.getItem('userId');
  const userName = localStorage.getItem('userName');
  const userPhone = localStorage.getItem('userPhone');
  const userRole = localStorage.getItem('userRole');
  if (userId) config.headers['x-user-id'] = userId;
  if (userName) config.headers['x-user-name'] = userName;
  if (userPhone) config.headers['x-user-phone'] = userPhone;
  if (userRole) config.headers['x-user-role'] = userRole;
  return config;
});

export default api;
