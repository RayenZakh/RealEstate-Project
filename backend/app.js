const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/authRoutes");
const propertyRoutes = require("./routes/propertyRoutes");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/properties", propertyRoutes);

app.get("/", (req, res) => {
    res.json({ message: "Dari backend is running" });
});

module.exports = app;