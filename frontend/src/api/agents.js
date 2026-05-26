import client from './client';

export const analyzeReport = (dogId) => client.post(`/agents/${dogId}/analyze`);
export const getTracking = (dogId) => client.post(`/agents/${dogId}/tracking`);
export const getAlerts = (dogId) => client.post(`/agents/${dogId}/alerts`);
export const sendChatMessage = (dogId, message, history) =>
  client.post(`/agents/${dogId}/chat`, { message, history });