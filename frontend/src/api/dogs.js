import client from './client';

export const getDogs = () => client.get('/api/dogs');
export const getDog = (id) => client.get(`/api/dogs/${id}`);
export const createDog = (data) => client.post('/api/dogs', data);
export const updateDog = (id, data) => client.put(`/api/dogs/${id}`, data);
export const deleteDog = (id) => client.delete(`/api/dogs/${id}`);