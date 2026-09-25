import { io } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_API_URL
    ? import.meta.env.VITE_API_URL.replace("/api", "")
    : "http://localhost:5000";

let socket = null;

// Connect to Socket.IO with the user's JWT token
export const connectSocket = (token) => {
    if (socket?.connected) return socket;

    socket = io(SOCKET_URL, {
        auth: { token },
        autoConnect: true,
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionAttempts: 5
    });

    socket.on("connect", () => {
        console.log("Socket connected:", socket.id);
    });

    socket.on("connect_error", (err) => {
        console.error("Socket connection error:", err.message);
    });

    return socket;
};

// Disconnect from Socket.IO
export const disconnectSocket = () => {
    if (socket) {
        socket.disconnect();
        socket = null;
    }
};

// Get the existing socket instance
export const getSocket = () => socket;
