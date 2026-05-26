import client from './client';

export const getSettings = () => client.get('/settings');
export const saveSettings = (data) => client.post('/settings', data);