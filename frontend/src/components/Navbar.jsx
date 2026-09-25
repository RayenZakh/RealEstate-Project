import { Link, useNavigate } from "react-router-dom";
import { FaHome, FaPlus, FaUser, FaSignInAlt, FaBars, FaTimes, FaEnvelope } from "react-icons/fa";
import { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import "../styles/Navbar.css";

function Navbar() {

    const [menuOpen, setMenuOpen] = useState(false);
    const navigate = useNavigate();
    const { token, user, logout } = useAuth();

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
                                <FaEnvelope />
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
                            <Link to="/messages" onClick={() => setMenuOpen(false)}>Messages</Link>
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