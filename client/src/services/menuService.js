import api from './api';

export const listMenuCounts = (date) => api.get('/menu-counts', { params: { date } });
export const createMenuCount = (payload) => api.post('/menu-counts', payload);
export const updateMenuCount = (id, payload) => api.put(`/menu-counts/${id}`, payload);
export const resetMenuCounts = (date) => api.post('/menu-counts/reset', { date });
