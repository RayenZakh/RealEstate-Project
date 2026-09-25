const express = require("express");
const cors = require("cors");
const path = require("path");

const authRoutes = require("./routes/authRoutes");
const propertyRoutes = require("./routes/propertyRoutes");
const uploadRoutes = require("./routes/uploadRoutes");

const { notFound, errorHandler } = require("./middleware/errorMiddleware");

const allowedOrigins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    process.env.CLIENT_URL
].filter(Boolean);

const app = express();

app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error(`CORS blocked request from origin: ${origin}`));
        }
    },
    credentials: true
}));
app.use(express.json());

// Serve uploaded static image files
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use("/api/auth", authRoutes);
app.use("/api/properties", propertyRoutes);
app.use("/api/upload", uploadRoutes);

app.get("/", (req, res) => {
    res.json({ message: "Dari backend is running" });
});

// Centralized error handling pipeline
app.use(notFound);
app.use(errorHandler);

module.exports = app;