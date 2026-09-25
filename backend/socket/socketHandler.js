const jwt = require("jsonwebtoken");
const Conversation = require("../models/Conversation");
const Message = require("../models/Message");

// Authenticate socket connections using the JWT from the handshake
const authenticateSocket = (socket, next) => {
    const token = socket.handshake.auth?.token;

    if (!token) {
        return next(new Error("Authentication required"));
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        socket.userId = decoded.userId;
        next();
    } catch (error) {
        return next(new Error("Invalid or expired token"));
    }
};

// Register socket event handlers after authentication
const registerSocketHandlers = (io) => {
    io.use(authenticateSocket);

    io.on("connection", (socket) => {
        console.log(`Socket connected: user ${socket.userId}`);

        // join_conversation – user joins a conversation room
        socket.on("join_conversation", async (conversationId) => {
            try {
                // Verify the user is a participant
                const conversation = await Conversation.findOne({
                    _id: conversationId,
                    participants: socket.userId
                });

                if (!conversation) {
                    socket.emit("error_message", {
                        message: "You are not a participant in this conversation"
                    });
                    return;
                }

                socket.join(conversationId);
                console.log(`User ${socket.userId} joined room ${conversationId}`);
            } catch (error) {
                socket.emit("error_message", {
                    message: "Failed to join conversation"
                });
            }
        });

        // leave_conversation – user leaves a conversation room
        socket.on("leave_conversation", (conversationId) => {
            socket.leave(conversationId);
        });

        // send_message – user sends a message to a conversation
        socket.on("send_message", async ({ conversationId, content }) => {
            try {
                // Validate content
                if (!content || typeof content !== "string" || content.trim().length === 0) {
                    socket.emit("error_message", {
                        message: "Message content is required"
                    });
                    return;
                }

                if (content.trim().length > 2000) {
                    socket.emit("error_message", {
                        message: "Message cannot exceed 2000 characters"
                    });
                    return;
                }

                // Verify participation
                const conversation = await Conversation.findOne({
                    _id: conversationId,
                    participants: socket.userId
                });

                if (!conversation) {
                    socket.emit("error_message", {
                        message: "You are not a participant in this conversation"
                    });
                    return;
                }

                // Save message to database – sender is determined from the authenticated socket
                const message = new Message({
                    conversation: conversationId,
                    sender: socket.userId,
                    content: content.trim()
                });

                await message.save();

                // Populate sender info for the response
                await message.populate("sender", "fullName");

                // Update conversation's lastMessage fields
                conversation.lastMessage = content.trim().substring(0, 100);
                conversation.lastMessageAt = message.createdAt;
                await conversation.save();

                // Emit to everyone in the room (including the sender)
                io.to(conversationId).emit("new_message", message);

                // Also emit a conversation_updated event so inbox lists can refresh
                // Notify each participant individually (they may not be in the room)
                conversation.participants.forEach((participantId) => {
                    io.to(`user_${participantId}`).emit("conversation_updated", {
                        conversationId,
                        lastMessage: conversation.lastMessage,
                        lastMessageAt: conversation.lastMessageAt
                    });
                });
            } catch (error) {
                console.error("send_message error:", error);
                socket.emit("error_message", {
                    message: "Failed to send message"
                });
            }
        });

        // message_read – mark messages as read and notify the other user
        socket.on("message_read", async (conversationId) => {
            try {
                const conversation = await Conversation.findOne({
                    _id: conversationId,
                    participants: socket.userId
                });

                if (!conversation) return;

                const now = new Date();

                await Message.updateMany(
                    {
                        conversation: conversationId,
                        sender: { $ne: socket.userId },
                        read: false
                    },
                    {
                        read: true,
                        readAt: now
                    }
                );

                // Notify room that messages were read
                socket.to(conversationId).emit("messages_marked_read", {
                    conversationId,
                    readBy: socket.userId,
                    readAt: now
                });
            } catch (error) {
                console.error("message_read error:", error);
            }
        });

        // Join a personal room for receiving inbox-level notifications
        socket.join(`user_${socket.userId}`);

        socket.on("disconnect", () => {
            console.log(`Socket disconnected: user ${socket.userId}`);
        });
    });
};

module.exports = registerSocketHandlers;
