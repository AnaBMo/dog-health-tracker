import client from './client';

export const getDocuments = (dogId) => client.get(`/dogs/${dogId}/documents`);
export const uploadDocument = (dogId, formData) =>
  client.post(`/dogs/${dogId}/documents`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
export const deleteDocument = (dogId, id) => client.delete(`/dogs/${dogId}/documents/${id}`);