import { useState, useEffect } from "react";
import { AuthContext } from "./authContextDef";
import api from "../services/api";

export function AuthProvider({ children }) {
    const [token, setToken] = useState(() => localStorage.getItem("token"));

    const [user, setUser] = useState(() => {
        try {
            const stored = localStorage.getItem("user");
            return stored ? JSON.parse(stored) : null;
        } catch {
            localStorage.removeItem("user");
            return null;
        }
    });

    const logout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        setToken(null);
        setUser(null);
    };

    const login = (newToken, newUser) => {
        localStorage.setItem("token", newToken);
        localStorage.setItem("user", JSON.stringify(newUser));

        setToken(newToken);
        setUser(newUser);
    };

    // Re-verify session on startup against backend /api/auth/me
    useEffect(() => {
        const verifySession = async () => {
            if (!token) return;
            try {
                const response = await api.get("/auth/me");
                setUser(response.data);
                localStorage.setItem("user", JSON.stringify(response.data));
            } catch (error) {
                // If token is invalid or expired, log out cleanly
                if (error.response && error.response.status === 401) {
                    logout();
                }
            }
        };

        verifySession();
    }, [token]);

    return (
        <AuthContext.Provider value={{ token, user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}