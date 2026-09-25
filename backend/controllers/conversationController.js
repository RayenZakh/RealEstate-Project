const Conversation = require("../models/Conversation");
const Message = require("../models/Message");
const Property = require("../models/Property");

// GET /api/conversations
// Returns all conversations the authenticated user participates in
const getConversations = async (req, res, next) => {
    try {
        const userId = req.user.userId;

        const conversations = await Conversation.find({
            participants: userId
        })
            .populate("participants", "fullName")
            .populate("property", "title images location")
            .sort({ lastMessageAt: -1 });

        // For each conversation, count the unread messages sent by the other participant
        const conversationsWithUnread = await Promise.all(
            conversations.map(async (conv) => {
                const unreadCount = await Message.countDocuments({
                    conversation: conv._id,
                    sender: { $ne: userId },
                    read: false
                });

                return {
                    ...conv.toObject(),
                    unreadCount
                };
            })
        );

        res.status(200).json(conversationsWithUnread);
    } catch (error) {
        next(error);
    }
};

// POST /api/conversations
// Find or create a conversation for (propertyId, current user, property owner)
const createConversation = async (req, res, next) => {
    try {
        const userId = req.user.userId;
        const { propertyId } = req.body;

        if (!propertyId) {
            return res.status(400).json({ message: "Property ID is required" });
        }

        // Verify the property exists and get its owner
        const property = await Property.findById(propertyId);

        if (!property) {
            return res.status(404).json({ message: "Property not found" });
        }

        const ownerId = property.owner.toString();

        // Prevent owner from contacting themselves
        if (ownerId === userId) {
            return res.status(400).json({
                message: "You cannot start a conversation on your own property"
            });
        }

        // Sort participant IDs to ensure consistent ordering for the unique index
        const participants = [userId, ownerId].sort();

        // Try to find an existing conversation
        let conversation = await Conversation.findOne({
            participants,
            property: propertyId
        })
            .populate("participants", "fullName")
            .populate("property", "title images location");

        if (conversation) {
            return res.status(200).json(conversation);
        }

        // Create a new conversation
        conversation = new Conversation({
            property: propertyId,
            participants
        });

        await conversation.save();

        // Populate for the response
        conversation = await Conversation.findById(conversation._id)
            .populate("participants", "fullName")
            .populate("property", "title images location");

        res.status(201).json(conversation);
    } catch (error) {
        next(error);
    }
};

// GET /api/conversations/:id
// Returns a single conversation (only if the user is a participant)
const getConversation = async (req, res, next) => {
    try {
        const userId = req.user.userId;

        const conversation = await Conversation.findOne({
            _id: req.params.id,
            participants: userId
        })
            .populate("participants", "fullName")
            .populate("property", "title images location");

        if (!conversation) {
            return res.status(404).json({ message: "Conversation not found" });
        }

        res.status(200).json(conversation);
    } catch (error) {
        next(error);
    }
};

// GET /api/conversations/:id/messages
// Returns all messages in the conversation (only if the user is a participant)
const getMessages = async (req, res, next) => {
    try {
        const userId = req.user.userId;

        // Verify participation
        const conversation = await Conversation.findOne({
            _id: req.params.id,
            participants: userId
        });

        if (!conversation) {
            return res.status(404).json({ message: "Conversation not found" });
        }

        const messages = await Message.find({
            conversation: req.params.id
        })
            .populate("sender", "fullName")
            .sort({ createdAt: 1 });

        res.status(200).json(messages);
    } catch (error) {
        next(error);
    }
};

// POST /api/conversations/:id/read
// Mark all unread messages from the other participant as read
const markAsRead = async (req, res, next) => {
    try {
        const userId = req.user.userId;

        // Verify participation
        const conversation = await Conversation.findOne({
            _id: req.params.id,
            participants: userId
        });

        if (!conversation) {
            return res.status(404).json({ message: "Conversation not found" });
        }

        const now = new Date();

        await Message.updateMany(
            {
                conversation: req.params.id,
                sender: { $ne: userId },
                read: false
            },
            {
                read: true,
                readAt: now
            }
        );

        res.status(200).json({ message: "Messages marked as read" });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getConversations,
    createConversation,
    getConversation,
    getMessages,
    markAsRead
};
