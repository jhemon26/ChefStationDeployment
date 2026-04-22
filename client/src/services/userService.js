import api from './api';

export const listUsers = () => api.get('/users');
export const suspendUser = (id) => api.put(`/users/${id}/suspend`);
export const activateUser = (id) => api.put(`/users/${id}/activate`);
export const deleteUser = (id) => api.delete(`/users/${id}`);
export const resetPassword = (id, password) => api.put(`/users/${id}/reset-password`, { password });
