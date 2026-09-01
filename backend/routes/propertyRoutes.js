const express = require("express");
const authenticateUser = require("../middleware/authMiddleware");
const {
    getAllProperties,
    getPropertyById,
    createProperty,
    deleteProperty
} = require("../controllers/propertyController");

const router = express.Router();

router.get("/", getAllProperties);
router.get("/:id", getPropertyById);
router.post("/", authenticateUser, createProperty);
router.delete("/:id", authenticateUser, deleteProperty);

module.exports = router;