import api from './api';

export const listDishes = () => api.get('/dishes');
export const createDish = (payload) => api.post('/dishes', payload);
export const updateDish = (id, payload) => api.put(`/dishes/${id}`, payload);
export const deleteDish = (id) => api.delete(`/dishes/${id}`);
