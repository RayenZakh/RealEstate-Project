import api from "./api";

export const getProperties = () => api.get("/properties");

export const getPropertyById = (id) => api.get(`/properties/${id}`);

export const createProperty = (data) => api.post("/properties", data);

export const deleteProperty = (id) => api.delete(`/properties/${id}`);