const express = require("express");
const upload = require("../middleware/uploadMiddleware");
const authenticateUser = require("../middleware/authMiddleware");

const router = express.Router();

// POST /api/upload - Upload up to 10 images (authenticated)
const handleUpload = (req, res, next) => {
    upload.array("images", 10)(req, res, (err) => {
        if (err) {
            return res.status(400).json({ message: err.message || "Image upload failed" });
        }

        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ message: "No image files provided" });
        }

        const urls = req.files.map((file) => `/uploads/${file.filename}`);

        res.status(200).json({
            message: "Images uploaded successfully",
            urls
        });
    });
};

router.post("/", authenticateUser, handleUpload);
router.post("", authenticateUser, handleUpload);

module.exports = router;
