import api from './api';

export const listRecipes = () => api.get('/recipes');
export const getRecipe = (id) => api.get(`/recipes/${id}`);
export const createRecipe = (payload) =>
  api.post('/recipes', payload, { headers: { 'Content-Type': 'multipart/form-data' } });
export const updateRecipe = (id, payload) =>
  api.put(`/recipes/${id}`, payload, { headers: { 'Content-Type': 'multipart/form-data' } });
export const deleteRecipe = (id) => api.delete(`/recipes/${id}`);
