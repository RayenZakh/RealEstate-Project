import "../styles/Auth.css";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";

import { registerUser } from "../services/authService";

function Register() {

    const {
        register,
        handleSubmit,
        formState: { errors }
    } = useForm();

    const navigate = useNavigate();

    const submitCall = async (data) => {
        try {
            await registerUser(data);

            alert("Account created successfully!");

            navigate("/login");

        } catch (error) {
            console.error(error);

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

                <h1>Create an account</h1>
                <p>Join Dari and find your next property.</p>

                <form className="forum" onSubmit={handleSubmit(submitCall)}>

                    <div className="form-group">
                        <label htmlFor="fullName">Full Name</label>
                        <input
                            {...register("fullName", {
                                required: "Name is required",
                                minLength: {
                                    value: 3,
                                    message: "Name must be at least 3 characters."
                                }
                            })}
                            type="text"
                            id="fullName"
                            placeholder="Enter your full name"
                        />
                        {errors.fullName && (
                            <div className="error-message">{errors.fullName.message}</div>
                        )}
                    </div>

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
                        <label htmlFor="phone">Phone Number</label>
                        <input
                            {...register("phone", {
                                required: "Phone number is required",
                                pattern: {
                                    value: /^\d{2}\s?\d{3}\s?\d{3}$/,
                                    message: "Use format: +216 XX XXX XXX"
                                }
                            })}
                            type="tel"
                            id="phone"
                            placeholder="+216 XX XXX XXX"
                        />
                        {errors.phone && (
                            <div className="error-message">{errors.phone.message}</div>
                        )}
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <input
                            {...register("password", {
                                required: "Password is required",
                                minLength: {
                                    value: 6,
                                    message: "Password must be at least 6 characters"
                                }
                            })}
                            type="password"
                            id="password"
                            placeholder="Enter your password"
                        />
                        {errors.password && (
                            <div className="error-message">{errors.password.message}</div>
                        )}
                    </div>

                    <button type="submit">Create Account</button>

                </form>

            </div>

        </div>
    );
}

export default Register;