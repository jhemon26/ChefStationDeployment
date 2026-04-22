import api from './api';

export const listRestaurants = () => api.get('/restaurants');
export const suspendRestaurant = (id) => api.put(`/restaurants/${id}/suspend`);
export const activateRestaurant = (id) => api.put(`/restaurants/${id}/activate`);
export const deleteRestaurant = (id) => api.delete(`/restaurants/${id}`);
