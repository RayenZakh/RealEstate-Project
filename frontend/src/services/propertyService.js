import api from "./api";

export const getProperties = () => api.get("/properties");

export const getPropertyById = (id) => api.get(`/properties/${id}`);

export const createProperty = (data) => api.post("/properties", data);

export const updateProperty = (id, data) => api.put(`/properties/${id}`, data);

export const deleteProperty = (id) => api.delete(`/properties/${id}`);

export const uploadPropertyImages = (files) => {
    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
        formData.append("images", files[i]);
    }
    return api.post("/upload", formData, {
        headers: {
            "Content-Type": "multipart/form-data"
        }
    });
};