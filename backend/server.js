const dotenv = require("dotenv");
dotenv.config();

const http = require("http");
const { Server } = require("socket.io");

const app = require("./app");
const connectDB = require("./config/db");
const registerSocketHandlers = require("./socket/socketHandler");

const PORT = process.env.PORT || 5000;

// Create an HTTP server from the Express app so Socket.IO can share the same port
const server = http.createServer(app);

// Attach Socket.IO with the same CORS origins used by Express
const allowedOrigins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    process.env.CLIENT_URL
].filter(Boolean);

const io = new Server(server, {
    cors: {
        origin: allowedOrigins,
        credentials: true
    }
});

// Register all socket event handlers (authentication, rooms, messaging)
registerSocketHandlers(io);

connectDB().then(() => {
    server.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
    });
});