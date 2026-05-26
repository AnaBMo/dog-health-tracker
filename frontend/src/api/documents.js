import client from './client';

export const getDocuments = (dogId) => client.get(`/api/dogs/${dogId}/documents`);
export const uploadDocument = (dogId, formData) =>
  client.post(`/api/dogs/${dogId}/documents`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
export const deleteDocument = (dogId, id) => client.delete(`/api/dogs/${dogId}/documents/${id}`);