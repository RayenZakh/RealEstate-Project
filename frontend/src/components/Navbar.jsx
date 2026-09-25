import { Link, useNavigate, useLocation } from "react-router-dom";
import { FaHome, FaPlus, FaUser, FaSignInAlt, FaBars, FaTimes, FaEnvelope } from "react-icons/fa";
import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../hooks/useAuth";
import { getConversations } from "../services/conversationService";
import { connectSocket } from "../services/socketService";
import "../styles/Navbar.css";

function Navbar() {

    const [menuOpen, setMenuOpen] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const navigate = useNavigate();
    const location = useLocation();
    const { token, user, logout } = useAuth();

    const fetchUnreadCount = useCallback(async () => {
        if (!token) {
            setUnreadCount(0);
            return;
        }
        try {
            const res = await getConversations();
            if (Array.isArray(res.data)) {
                const total = res.data.reduce((sum, conv) => sum + (conv.unreadCount || 0), 0);
                setUnreadCount(total);
            }
        } catch (err) {
            // Silently handle request failure
        }
    }, [token]);

    useEffect(() => {
        if (!token) {
            setUnreadCount(0);
            return;
        }

        fetchUnreadCount();

        const socket = connectSocket(token);

        const handleUpdate = () => {
            fetchUnreadCount();
        };

        socket.on("conversation_updated", handleUpdate);
        socket.on("new_message", handleUpdate);
        socket.on("messages_marked_read", handleUpdate);
        window.addEventListener("messages_read", handleUpdate);

        return () => {
            socket.off("conversation_updated", handleUpdate);
            socket.off("new_message", handleUpdate);
            socket.off("messages_marked_read", handleUpdate);
            window.removeEventListener("messages_read", handleUpdate);
        };
    }, [token, fetchUnreadCount]);

    // Re-fetch whenever navigating between pages
    useEffect(() => {
        if (token) {
            fetchUnreadCount();
        }
    }, [location.pathname, token, fetchUnreadCount]);

    const handleLogout = () => {
        logout();
        navigate("/");
        setMenuOpen(false);
    };

    return (
        <nav className="navbar">

            <div className="navbar-container">

                <Link
                    to="/"
                    className="navbar-logo"
                    onClick={() => setMenuOpen(false)}
                >
                    <FaHome />
                    <span>Dari</span>
                </Link>

                <div className="navbar-links">
                    <Link to="/">Home</Link>
                    <Link to="/PropertyMap">Properties</Link>
                    <Link to="/AddProperty">
                        <FaPlus />
                        Add Property
                    </Link>
                </div>

                <div className="navbar-actions">

                    {token && user ? (

                        <>
                            <Link to="/messages" className="navbar-messages">
                                <span className="navbar-messages-icon-wrapper">
                                    <FaEnvelope />
                                    {unreadCount > 0 && <span className="navbar-unread-dot" />}
                                </span>
                                <span>Messages</span>
                            </Link>

                            <Link to="/profile" className="navbar-user">
                                <FaUser />
                                <span>{user.fullName}</span>
                            </Link>

                            <button className="logout-button" onClick={handleLogout}>
                                Logout
                            </button>
                        </>

                    ) : (

                        <>
                            <Link to="/login" className="login-button">
                                <FaSignInAlt />
                                Login
                            </Link>

                            <Link to="/register" className="register-button">
                                Create Account
                            </Link>
                        </>

                    )}

                </div>

                <button
                    className="mobile-menu-button"
                    onClick={() => setMenuOpen(!menuOpen)}
                >
                    {menuOpen ? <FaTimes /> : <FaBars />}
                </button>

            </div>

            {menuOpen && (
                <div className="mobile-menu">

                    <Link to="/" onClick={() => setMenuOpen(false)}>Home</Link>
                    <Link to="/PropertyMap" onClick={() => setMenuOpen(false)}>Properties</Link>
                    <Link to="/AddProperty" onClick={() => setMenuOpen(false)}>Add Property</Link>

                    {token ? (
                        <>
                            <Link to="/messages" onClick={() => setMenuOpen(false)} className="mobile-messages-link">
                                <span>Messages</span>
                                {unreadCount > 0 && <span className="navbar-unread-dot mobile-dot" />}
                            </Link>
                            <Link to="/profile" onClick={() => setMenuOpen(false)}>Profile</Link>
                            <button onClick={handleLogout}>Logout</button>
                        </>
                    ) : (
                        <>
                            <Link to="/login" onClick={() => setMenuOpen(false)}>Login</Link>
                            <Link to="/register" onClick={() => setMenuOpen(false)}>Create Account</Link>
                        </>
                    )}

                </div>
            )}

        </nav>
    );
}

export default Navbar;