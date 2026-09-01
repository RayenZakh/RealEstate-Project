import { createContext, useState } from "react";

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {

    const [token, setToken] = useState(
        () => localStorage.getItem("token")
    );

    const [user, setUser] = useState(() => {
        const stored = localStorage.getItem("user");
        return stored ? JSON.parse(stored) : null;
    });

    // Called after a successful login/register to store the session
    const login = (newToken, newUser) => {
        localStorage.setItem("token", newToken);
        localStorage.setItem("user", JSON.stringify(newUser));

        setToken(newToken);
        setUser(newUser);
    };

    const logout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        setToken(null);
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ token, user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}