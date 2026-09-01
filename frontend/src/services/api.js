import axios from "axios";

// Centralized axios instance.
// Base URL comes from an env variable so it's not hardcoded in every page.
// Falls back to localhost for local dev.
const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api"
});

// Automatically attach the JWT token (if present) to every request.
// This removes the need for each page to manually read localStorage
// and build the Authorization header itself.
api.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
});

export default api;