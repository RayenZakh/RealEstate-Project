import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

// Wrap any page that requires login with this component.
// Usage in App.jsx: <ProtectedRoute><AddProperty /></ProtectedRoute>
function ProtectedRoute({ children }) {

    const { token } = useAuth();
    const navigate = useNavigate();

    if (!token) {
        return (
            <div className="auth-required">
                <h1>Login required</h1>
                <p>You need an account to access this page.</p>
                <button onClick={() => navigate("/login")}>
                    Login
                </button>
            </div>
        );
    }

    return children;
}

export default ProtectedRoute;