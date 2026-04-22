import api from './api';

export const listStock = () => api.get('/stock');
export const listLowStock = () => api.get('/stock/low-stock');
export const createStockItem = (payload) => api.post('/stock', payload);
export const updateStockItem = (id, payload) => api.put(`/stock/${id}`, payload);
export const deleteStockItem = (id) => api.delete(`/stock/${id}`);

export const listStockCategories = () => api.get('/stock/categories');
export const createStockCategory = (name) => api.post('/stock/categories', { name });
export const deleteStockCategory = (id) => api.delete(`/stock/categories/${id}`);
