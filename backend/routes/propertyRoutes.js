const express = require("express");
const authenticateUser = require("../middleware/authMiddleware");
const {
    getAllProperties,
    getPropertyById,
    createProperty,
    updateProperty,
    deleteProperty
} = require("../controllers/propertyController");

const router = express.Router();

router.get("/", getAllProperties);
router.get("/:id", getPropertyById);
router.post("/", authenticateUser, createProperty);
router.put("/:id", authenticateUser, updateProperty);
router.delete("/:id", authenticateUser, deleteProperty);

module.exports = router;