import api from "./api";

export const getConversations = () => api.get("/conversations");

export const createConversation = (propertyId) =>
    api.post("/conversations", { propertyId });

export const getConversation = (id) => api.get(`/conversations/${id}`);

export const getMessages = (id) => api.get(`/conversations/${id}/messages`);

export const markAsRead = (id) => api.post(`/conversations/${id}/read`);
