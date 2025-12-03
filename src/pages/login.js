import { useState, useEffect } from "react";
import FloatingInput from "../utils/InputForm";
import PasswordInput from "../utils/PasswordInput";
import ForgotPasswordModal from "../Components/ForgotPasswordModal";
import { useAuth } from "../API/Auth";
import "./Login.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner } from "@fortawesome/free-solid-svg-icons";
import MessageModal from "../Components/MessageModal/MessageModal.jsx";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showModal, setShowModal] = useState(false);

  const { handleLogin, message, successMessage, isLoggingIn } = useAuth();

  const [showSuccessModal, setShowSuccessModal] = useState(false);

  useEffect(() => {
    if (successMessage) {
      setShowSuccessModal(true);

      const timer = setTimeout(() => {
        setShowSuccessModal(false);
        navigate("/dashboard");
      }, 3000); // redirect after 3s

      return () => clearTimeout(timer);
    }
  }, [successMessage, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await handleLogin(username, password);
  };

  const closeMessageModal = () => setShowSuccessModal(false);

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

          {/* Inline error for non-success messages */}
          {message && !successMessage && <p className="error-text">{message}</p>}
        </form>
      </div>

      {showModal && <ForgotPasswordModal onClose={() => setShowModal(false)} />}

      {/* Success Modal */}
      {showSuccessModal && (
        <MessageModal
          message={successMessage}
          type="success"
          onClose={closeMessageModal}
        />
      )}
    </div>
  );
};

export default Login;
