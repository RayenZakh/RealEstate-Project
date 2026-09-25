const express = require("express");
const authenticateUser = require("../middleware/authMiddleware");
const {
    getConversations,
    createConversation,
    getConversation,
    getMessages,
    markAsRead
} = require("../controllers/conversationController");

const router = express.Router();

// All conversation routes require authentication
router.use(authenticateUser);

router.get("/", getConversations);
router.post("/", createConversation);
router.get("/:id", getConversation);
router.get("/:id/messages", getMessages);
router.post("/:id/read", markAsRead);

module.exports = router;
