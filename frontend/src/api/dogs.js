import client from './client';

export const getDogs = () => client.get('/dogs');
export const getDog = (id) => client.get(`/dogs/${id}`);
export const createDog = (data) => client.post('/dogs', data);
export const updateDog = (id, data) => client.put(`/dogs/${id}`, data);
export const deleteDog = (id) => client.delete(`/dogs/${id}`);