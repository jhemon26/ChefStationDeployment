import api from './api';

export const listPrepTasks = (date) => api.get('/prep-tasks', { params: { date } });
export const createPrepTask = (payload) => api.post('/prep-tasks', payload);
export const updatePrepTask = (id, payload) => api.put(`/prep-tasks/${id}`, payload);
export const deletePrepTask = (id) => api.delete(`/prep-tasks/${id}`);
