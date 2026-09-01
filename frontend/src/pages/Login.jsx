import "../styles/Auth.css";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";

import { loginUser } from "../services/authService";
import { useAuth } from "../hooks/useAuth";

function Login() {

    const {
        register,
        handleSubmit,
        formState: { errors }
    } = useForm();

    const navigate = useNavigate();
    const { login } = useAuth();

    const submitCall = async (data) => {
        try {
            const response = await loginUser(data);

            login(response.data.token, response.data.user);

            navigate("/");

        } catch (error) {
            console.error("Login error:", error);

            if (error.response) {
                alert(error.response.data.message);
            } else {
                alert("Could not connect to the server");
            }
        }
    };

    return (
        <div className="register-container">

            <div className="register-box">

                <h1>Welcome Back</h1>
                <p>Login to your Dari account.</p>

                <form className="forum" onSubmit={handleSubmit(submitCall)}>

                    <div className="form-group">
                        <label htmlFor="email">Email</label>
                        <input
                            {...register("email", {
                                required: "Email is required",
                                pattern: {
                                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                    message: "Please enter a valid email address"
                                }
                            })}
                            type="email"
                            id="email"
                            placeholder="Enter your email"
                        />
                        {errors.email && (
                            <div className="error-message">{errors.email.message}</div>
                        )}
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <input
                            {...register("password", {
                                required: "Password is required"
                            })}
                            type="password"
                            id="password"
                            placeholder="Enter your password"
                        />
                        {errors.password && (
                            <div className="error-message">{errors.password.message}</div>
                        )}
                    </div>

                    <button type="submit">Login</button>

                </form>

            </div>

        </div>
    );
}

export default Login;