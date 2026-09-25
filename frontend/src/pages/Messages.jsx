import { useState, useEffect, useRef, useCallback } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import {
    FaPaperPlane,
    FaArrowLeft,
    FaComments,
    FaHome,
    FaCircle
} from "react-icons/fa";

import { useAuth } from "../hooks/useAuth";
import {
    getConversations,
    getMessages,
    markAsRead
} from "../services/conversationService";
import { connectSocket, disconnectSocket, getSocket } from "../services/socketService";
import { getImageUrl, DEFAULT_PLACEHOLDER_IMAGE } from "../utils/imageHelper";
import "../styles/Messages.css";

function Messages() {
    const { user, token } = useAuth();
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();

    const [conversations, setConversations] = useState([]);
    const [activeConversation, setActiveConversation] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");
    const [loading, setLoading] = useState(true);
    const [messagesLoading, setMessagesLoading] = useState(false);
    const [error, setError] = useState(null);
    const [sending, setSending] = useState(false);

    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);
    const activeConversationRef = useRef(null);

    // Keep ref in sync with state so socket callbacks see the latest value
    useEffect(() => {
        activeConversationRef.current = activeConversation;
    }, [activeConversation]);

    const scrollToBottom = useCallback(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, []);

    // Load conversation list
    const loadConversations = useCallback(async () => {
        try {
            const res = await getConversations();
            setConversations(res.data);
        } catch (err) {
            console.error("Failed to load conversations:", err);
            setError("Failed to load conversations");
        } finally {
            setLoading(false);
        }
    }, []);

    // Load messages for a conversation
    const loadMessages = useCallback(async (conversationId) => {
        setMessagesLoading(true);
        try {
            const res = await getMessages(conversationId);
            setMessages(res.data);

            // Mark messages as read
            await markAsRead(conversationId);

            // Update unread count in the conversations list
            setConversations((prev) =>
                prev.map((conv) =>
                    conv._id === conversationId
                        ? { ...conv, unreadCount: 0 }
                        : conv
                )
            );

            // Emit read event via socket
            const socket = getSocket();
            if (socket?.connected) {
                socket.emit("message_read", conversationId);
            }
        } catch (err) {
            console.error("Failed to load messages:", err);
        } finally {
            setMessagesLoading(false);
        }
    }, []);

    // Connect socket and set up event listeners
    useEffect(() => {
        if (!token) return;

        const socket = connectSocket(token);

        socket.on("new_message", (message) => {
            const currentConvId = activeConversationRef.current?._id;

            if (message.conversation === currentConvId) {
                setMessages((prev) => {
                    // Prevent duplicate messages
                    if (prev.some((m) => m._id === message._id)) return prev;
                    return [...prev, message];
                });

                // Mark as read immediately if we're viewing this conversation
                if (message.sender._id !== user.id) {
                    markAsRead(currentConvId);
                    socket.emit("message_read", currentConvId);
                }
            }

            // Update conversation list
            setConversations((prev) => {
                const updated = prev.map((conv) => {
                    if (conv._id === message.conversation) {
                        return {
                            ...conv,
                            lastMessage: message.content.substring(0, 100),
                            lastMessageAt: message.createdAt,
                            unreadCount:
                                message.conversation === currentConvId
                                    ? 0
                                    : (conv.unreadCount || 0) + (message.sender._id !== user.id ? 1 : 0)
                        };
                    }
                    return conv;
                });

                // Sort by most recent message
                return updated.sort(
                    (a, b) => new Date(b.lastMessageAt) - new Date(a.lastMessageAt)
                );
            });
        });

        socket.on("messages_marked_read", ({ conversationId }) => {
            // If we're in this conversation, update message read status visually
            const currentConvId = activeConversationRef.current?._id;
            if (conversationId === currentConvId) {
                setMessages((prev) =>
                    prev.map((msg) =>
                        msg.sender._id === user.id && !msg.read
                            ? { ...msg, read: true, readAt: new Date().toISOString() }
                            : msg
                    )
                );
            }
        });

        socket.on("error_message", ({ message }) => {
            console.error("Socket error:", message);
        });

        return () => {
            disconnectSocket();
        };
    }, [token, user?.id]);

    // Load conversations on mount
    useEffect(() => {
        if (token) {
            loadConversations();
        }
    }, [token, loadConversations]);

    // Handle ?conversation=xxx query param (from Contact Owner redirect)
    useEffect(() => {
        const convId = searchParams.get("conversation");
        if (convId && conversations.length > 0) {
            const conv = conversations.find((c) => c._id === convId);
            if (conv) {
                selectConversation(conv);
                // Clear the query param
                setSearchParams({}, { replace: true });
            }
        }
    }, [conversations, searchParams]);

    // Scroll to bottom when messages change
    useEffect(() => {
        scrollToBottom();
    }, [messages, scrollToBottom]);

    const selectConversation = useCallback(
        (conversation) => {
            // Leave previous room
            const socket = getSocket();
            if (activeConversation && socket?.connected) {
                socket.emit("leave_conversation", activeConversation._id);
            }

            setActiveConversation(conversation);
            setMessages([]);

            // Join new room
            if (socket?.connected) {
                socket.emit("join_conversation", conversation._id);
            }

            loadMessages(conversation._id);
            inputRef.current?.focus();
        },
        [activeConversation, loadMessages]
    );

    const handleSendMessage = useCallback(
        (e) => {
            e.preventDefault();

            const content = newMessage.trim();
            if (!content || !activeConversation || sending) return;

            const socket = getSocket();
            if (!socket?.connected) {
                console.error("Socket not connected");
                return;
            }

            setSending(true);
            socket.emit("send_message", {
                conversationId: activeConversation._id,
                content
            });

            setNewMessage("");
            setSending(false);
            inputRef.current?.focus();
        },
        [newMessage, activeConversation, sending]
    );

    const handleBackToList = () => {
        const socket = getSocket();
        if (activeConversation && socket?.connected) {
            socket.emit("leave_conversation", activeConversation._id);
        }
        setActiveConversation(null);
        setMessages([]);
    };

    // Get the other participant's name
    const getOtherParticipant = (conversation) => {
        if (!conversation?.participants) return { fullName: "Unknown" };
        return conversation.participants.find((p) => p._id !== user.id) || { fullName: "Unknown" };
    };

    // Format timestamps
    const formatTime = (dateStr) => {
        if (!dateStr) return "";
        const date = new Date(dateStr);
        const now = new Date();
        const diffMs = now - date;
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

        if (diffDays === 0) {
            return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
        } else if (diffDays === 1) {
            return "Yesterday";
        } else if (diffDays < 7) {
            return date.toLocaleDateString([], { weekday: "short" });
        }
        return date.toLocaleDateString([], { month: "short", day: "numeric" });
    };

    const formatMessageTime = (dateStr) => {
        if (!dateStr) return "";
        return new Date(dateStr).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit"
        });
    };

    // Get property thumbnail
    const getPropertyThumb = (conversation) => {
        const images = conversation?.property?.images;
        if (images && images.length > 0) {
            return getImageUrl(images[0]);
        }
        return DEFAULT_PLACEHOLDER_IMAGE;
    };

    if (!token) {
        return (
            <div className="messages-auth-required">
                <FaComments className="messages-auth-icon" />
                <h2>Login Required</h2>
                <p>You need to be logged in to view your messages.</p>
                <button onClick={() => navigate("/login")} className="messages-login-btn">
                    Login
                </button>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="messages-loading">
                <div className="messages-spinner"></div>
                <p>Loading conversations...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="messages-error">
                <p>{error}</p>
                <button onClick={loadConversations} className="messages-retry-btn">
                    Retry
                </button>
            </div>
        );
    }

    return (
        <div className="messages-container">
            {/* Conversation List Sidebar */}
            <div className={`messages-sidebar ${activeConversation ? "hide-mobile" : ""}`}>
                <div className="messages-sidebar-header">
                    <h2>Messages</h2>
                </div>

                {conversations.length === 0 ? (
                    <div className="messages-empty">
                        <FaComments className="messages-empty-icon" />
                        <p>No conversations yet</p>
                        <span>Contact a property owner to start chatting</span>
                    </div>
                ) : (
                    <div className="messages-list">
                        {conversations.map((conv) => {
                            const other = getOtherParticipant(conv);
                            const isActive = activeConversation?._id === conv._id;

                            return (
                                <button
                                    key={conv._id}
                                    className={`conversation-item ${isActive ? "active" : ""}`}
                                    onClick={() => selectConversation(conv)}
                                >
                                    <img
                                        src={getPropertyThumb(conv)}
                                        alt=""
                                        className="conversation-thumb"
                                    />
                                    <div className="conversation-info">
                                        <div className="conversation-header-row">
                                            <span className="conversation-name">
                                                {other.fullName}
                                            </span>
                                            <span className="conversation-time">
                                                {formatTime(conv.lastMessageAt)}
                                            </span>
                                        </div>
                                        <div className="conversation-property-name">
                                            <FaHome />
                                            {conv.property?.title || "Property"}
                                        </div>
                                        <div className="conversation-preview-row">
                                            <span className="conversation-preview">
                                                {conv.lastMessage || "No messages yet"}
                                            </span>
                                            {conv.unreadCount > 0 && (
                                                <span className="conversation-unread-badge">
                                                    {conv.unreadCount}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Chat Window */}
            <div className={`messages-chat ${activeConversation ? "show-mobile" : ""}`}>
                {activeConversation ? (
                    <>
                        {/* Chat Header */}
                        <div className="chat-header">
                            <button
                                className="chat-back-btn"
                                onClick={handleBackToList}
                            >
                                <FaArrowLeft />
                            </button>

                            <img
                                src={getPropertyThumb(activeConversation)}
                                alt=""
                                className="chat-header-thumb"
                            />

                            <div className="chat-header-info">
                                <span className="chat-header-name">
                                    {getOtherParticipant(activeConversation).fullName}
                                </span>
                                <Link
                                    to={`/properties/${activeConversation.property?._id}`}
                                    className="chat-header-property"
                                >
                                    <FaHome />
                                    {activeConversation.property?.title || "Property"}
                                </Link>
                            </div>
                        </div>

                        {/* Messages Area */}
                        <div className="chat-messages">
                            {messagesLoading ? (
                                <div className="chat-loading">
                                    <div className="messages-spinner"></div>
                                    <p>Loading messages...</p>
                                </div>
                            ) : messages.length === 0 ? (
                                <div className="chat-empty">
                                    <p>No messages yet. Say hello!</p>
                                </div>
                            ) : (
                                <>
                                    {/* Property context banner */}
                                    <div className="chat-property-banner">
                                        <img
                                            src={getPropertyThumb(activeConversation)}
                                            alt=""
                                        />
                                        <div>
                                            <span className="chat-property-banner-title">
                                                {activeConversation.property?.title}
                                            </span>
                                            <span className="chat-property-banner-location">
                                                {activeConversation.property?.location?.city}
                                            </span>
                                        </div>
                                    </div>

                                    {messages.map((msg) => {
                                        const isMine =
                                            msg.sender._id === user.id ||
                                            msg.sender === user.id;

                                        return (
                                            <div
                                                key={msg._id}
                                                className={`chat-message ${isMine ? "mine" : "theirs"}`}
                                            >
                                                <div className="chat-bubble">
                                                    <p>{msg.content}</p>
                                                    <div className="chat-message-meta">
                                                        <span className="chat-message-time">
                                                            {formatMessageTime(msg.createdAt)}
                                                        </span>
                                                        {isMine && msg.read && (
                                                            <span className="chat-read-indicator">
                                                                ✓✓
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Message Input */}
                        <form className="chat-input-form" onSubmit={handleSendMessage}>
                            <input
                                ref={inputRef}
                                type="text"
                                className="chat-input"
                                placeholder="Type a message..."
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                maxLength={2000}
                                autoComplete="off"
                            />
                            <button
                                type="submit"
                                className="chat-send-btn"
                                disabled={!newMessage.trim() || sending}
                            >
                                <FaPaperPlane />
                            </button>
                        </form>
                    </>
                ) : (
                    <div className="chat-placeholder">
                        <FaComments className="chat-placeholder-icon" />
                        <h3>Select a conversation</h3>
                        <p>Choose a conversation from the list to start chatting</p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Messages;
