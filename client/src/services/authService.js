import api from './api';

export const login = (payload) => api.post('/auth/login', payload);
export const registerRestaurant = (payload) => api.post('/auth/register-restaurant', payload);
export const registerStaff = (payload) => api.post('/auth/register-staff', payload);
export const me = () => api.get('/auth/me');
