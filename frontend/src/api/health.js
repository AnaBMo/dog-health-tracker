import client from './client';

export const getVetVisits = (dogId) => client.get(`/api/dogs/${dogId}/vet-visits`);
export const createVetVisit = (dogId, data) => client.post(`/api/dogs/${dogId}/vet-visits`, data);
export const updateVetVisit = (dogId, id, data) => client.put(`/api/dogs/${dogId}/vet-visits/${id}`, data);
export const deleteVetVisit = (dogId, id) => client.delete(`/api/dogs/${dogId}/vet-visits/${id}`);

export const getVaccines = (dogId) => client.get(`/api/dogs/${dogId}/vaccines`);
export const createVaccine = (dogId, data) => client.post(`/api/dogs/${dogId}/vaccines`, data);
export const updateVaccine = (dogId, id, data) => client.put(`/api/dogs/${dogId}/vaccines/${id}`, data);
export const deleteVaccine = (dogId, id) => client.delete(`/api/dogs/${dogId}/vaccines/${id}`);

export const getTreatments = (dogId) => client.get(`/api/dogs/${dogId}/treatments`);
export const createTreatment = (dogId, data) => client.post(`/api/dogs/${dogId}/treatments`, data);
export const updateTreatment = (dogId, id, data) => client.put(`/api/dogs/${dogId}/treatments/${id}`, data);
export const deleteTreatment = (dogId, id) => client.delete(`/api/dogs/${dogId}/treatments/${id}`);

export const getAllergies = (dogId) => client.get(`/api/dogs/${dogId}/allergies`);
export const createAllergy = (dogId, data) => client.post(`/api/dogs/${dogId}/allergies`, data);
export const updateAllergy = (dogId, id, data) => client.put(`/api/dogs/${dogId}/allergies/${id}`, data);
export const deleteAllergy = (dogId, id) => client.delete(`/api/dogs/${dogId}/allergies/${id}`);