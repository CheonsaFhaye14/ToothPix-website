import { useState } from "react";
import FloatingInput from "../utils/InputForm";
import PasswordInput from "../utils/PasswordInput";
import ForgotPasswordModal from "../Components/ForgotPasswordModal";
import { useAuth } from "../API/Auth"; // ✅ THIS one handles API
import "./Login.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner } from "@fortawesome/free-solid-svg-icons";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showModal, setShowModal] = useState(false);

  // ✅ useAuth hook provides handleLogin, messages, and isLoggingIn state
const { handleLogin, message, isLoggingIn } = useAuth(); // NOT useAdminAuth

  const handleSubmit = async (e) => {
    e.preventDefault();
    // call the hook's handleLogin
    await handleLogin(username, password);
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
