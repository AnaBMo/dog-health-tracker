import client from './client';

export const getSettings = () => client.get('/api/settings');
export const saveSettings = (data) => client.post('/api/settings', data);