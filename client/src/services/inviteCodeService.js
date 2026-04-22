import api from './api';

export const listInviteCodes = () => api.get('/invite-codes');
export const createInviteCode = () => api.post('/invite-codes', { role: 'staff' });
export const deleteInviteCode = (id) => api.delete(`/invite-codes/${id}`);
