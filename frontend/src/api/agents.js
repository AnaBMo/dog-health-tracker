import client from './client';

export const analyzeReport = (dogId) => client.post(`/api/agents/${dogId}/analyze`);
export const getTracking = (dogId) => client.post(`/api/agents/${dogId}/tracking`);
export const getAlerts = (dogId) => client.post(`/api/agents/${dogId}/alerts`);
export const sendChatMessage = (dogId, message, history) =>
  client.post(`/api/agents/${dogId}/chat`, { message, history });