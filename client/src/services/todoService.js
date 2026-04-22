import api from './api';

export const listTodos = (date) => api.get('/todos', { params: { date } });
export const createTodo = (payload) => api.post('/todos', payload);
export const updateTodo = (id, payload) => api.put(`/todos/${id}`, payload);
export const deleteTodo = (id) => api.delete(`/todos/${id}`);
