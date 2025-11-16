import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { BASE_URL } from "../config";
import FloatingInput from "../utils/InputForm";
import PasswordInput from "../utils/PasswordInput"; // ✅ use combined component
import ForgotPasswordModal from "../Components/ForgotPasswordModal";
import { useAdminAuth } from "../pages/Start/useAdminAuth";
import "./Login.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner } from "@fortawesome/free-solid-svg-icons";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const navigate = useNavigate();

  const { login } = useAdminAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setIsLoggingIn(true);

    try {
      const res = await fetch(`${BASE_URL}/api/website/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (res.ok) {
        login(data.token);
        setMessage("");
        setTimeout(() => navigate("/dashboard"), 1500);
      } else {
        setMessage(data.message || "Login failed.");
      }
    } catch (err) {
      console.error(err);
      setMessage("An error occurred. Please try again.");
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h1>Admin Login</h1>

        <form onSubmit={handleSubmit}>
          <FloatingInput
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            name="username"
          />

          {/* Password field using combined component */}
          <PasswordInput
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            name="password"
          />

          <p className="forgot-password">
            <span
              onClick={() => setShowModal(true)}
              style={{ cursor: "pointer", color: "#75c5f1", fontWeight: 500 }}
            >
              Forgot Password?
            </span>
          </p>

          <button type="submit" disabled={isLoggingIn}>
            {isLoggingIn ? (
              <>
                <FontAwesomeIcon icon={faSpinner} spin />
                <span style={{ marginLeft: "8px" }}>Logging in...</span>
              </>
            ) : (
              "Login"
            )}
          </button>

          {message && <p className="error-text">{message}</p>}
        </form>
      </div>

      {showModal && <ForgotPasswordModal onClose={() => setShowModal(false)} />}
    </div>
  );
};

export default Login;
