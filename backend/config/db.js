const mongoose = require("mongoose");

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            serverSelectionTimeoutMS: 5000
        });
        console.log("Connected to MongoDB Atlas");
    } catch (error) {
        console.error("MongoDB connection error:", error.message);
        console.error("Tip: Check your MONGO_URI in .env and ensure your IP is whitelisted in MongoDB Atlas Network Access.");
        process.exit(1); // stop the app if DB connection fails
    }
};

module.exports = connectDB;