import { Link } from "react-router-dom";
import { FaHome, FaExclamationTriangle } from "react-icons/fa";

function NotFound() {
    return (
        <div style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "65vh",
            padding: "40px 20px",
            textAlign: "center",
            background: "#FAF7F2"
        }}>
            <FaExclamationTriangle style={{ fontSize: "56px", color: "#D9A24C", marginBottom: "20px" }} />
            <h1 style={{ fontSize: "36px", color: "#1B2733", marginBottom: "12px", fontWeight: "600" }}>
                404 — Page Not Found
            </h1>
            <p style={{ fontSize: "16px", color: "#5A6872", maxWidth: "450px", marginBottom: "28px", lineHeight: "1.6" }}>
                The page you are looking for doesn't exist, has been moved, or is temporarily unavailable.
            </p>
            <Link
                to="/"
                style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "8px",
                    background: "#1B2733",
                    color: "#FFFFFF",
                    padding: "12px 24px",
                    borderRadius: "6px",
                    textDecoration: "none",
                    fontWeight: "500",
                    fontSize: "15px",
                    transition: "background 0.2s"
                }}
            >
                <FaHome /> Return to Home
            </Link>
        </div>
    );
}

export default NotFound;
