import "../styles/Footer.css";
import { Link } from "react-router-dom";
import { FaFacebook, FaTelegram, FaHome } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";

const Footer = () => {

    const year = new Date().getFullYear();

    return (
        <footer className="footer">
            <div className="footer-container">

                <div className="footer-brand">

                    <div className="logo">
                        <FaHome className="logo-icon" />
                        <span className="logo-text">Dari</span>
                    </div>

                    <div className="brand-description">
                        <p>
                            Find your next home. <br />
                            Discover properties for sale and for rent across Tunisia.
                        </p>
                    </div>

                    <div className="social-icons">
                        <a href="#" aria-label="Facebook" target="_blank" rel="noopener noreferrer">
                            <FaFacebook />
                        </a>
                        <a href="#" aria-label="X (Twitter)" target="_blank" rel="noopener noreferrer">
                            <FaXTwitter />
                        </a>
                        <a href="#" aria-label="Telegram" target="_blank" rel="noopener noreferrer">
                            <FaTelegram />
                        </a>
                    </div>

                </div>

                <div className="brand-platforme">
                    <h4>Platform</h4>
                    <ul>
                        <li>
                            <Link to="/PropertyMap?listingType=sale">Buy</Link>
                        </li>
                        <li>
                            <Link to="/PropertyMap?listingType=rent">Rent</Link>
                        </li>
                        <li>
                            <Link to="/AddProperty">Sell</Link>
                        </li>
                        <li>
                            <Link to="/AddProperty">Add Property</Link>
                        </li>
                    </ul>
                </div>

                <div className="brand-resources">
                    <h4>Resources</h4>
                    <ul>
                        <li><Link to="/">About Dari</Link></li>
                        <li><Link to="/PropertyMap">Browse properties</Link></li>
                        <li><Link to="/register">Create an account</Link></li>
                        <li><Link to="/login">Login</Link></li>
                    </ul>
                </div>

                <div className="brand-contact">
                    <h4>Contact</h4>
                    <ul>
                        <li>Tunis, Monastir</li>
                        <li>
                            <a href="mailto:contact@dari.tn">contact@dari.tn</a>
                        </li>
                        <li>
                            <a href="tel:+21600000000">+216 00 000 000</a>
                        </li>
                    </ul>
                </div>

                <div className="bottom-footer">
                    <p>&copy; {year} Dari. All rights reserved.</p>
                </div>

            </div>
        </footer>
    );

};

export default Footer;