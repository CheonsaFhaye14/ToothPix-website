import React, { useState } from "react"; 
import { BASE_URL } from "../config";
import FloatingInput from "../utils/InputForm";
import "./ForgotPasswordModal.css";

const ForgotPasswordModal = ({ onClose }) => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("error"); // 'error' or 'success'

  const validateEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setMessageType("error");

    if (!email.trim()) {
      setMessage("Please enter your email.");
      return;
    }

    if (!validateEmail(email)) {
      setMessage("Please enter a valid email address.");
      return;
    }

    try {
      const res = await fetch(`${BASE_URL}/api/admin`);
      const data = await res.json();

      if (res.ok) {
        const adminEmails = data.admin.map((admin) => admin.email.toLowerCase());
        if (adminEmails.includes(email.toLowerCase())) {
          const resetRes = await fetch(`${BASE_URL}/api/request-reset-password`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email }),
          });
          const resetData = await resetRes.json();

          if (resetRes.ok) {
            setMessage("✅ Password reset link sent to your email!");
            setMessageType("success");
            // Optionally close after a short delay
            setTimeout(onClose, 2000);
          } else {
            setMessage(resetData.message || "Error sending reset link.");
          }

        } else {
          setMessage("Email does not match any admin account.");
        }
      } else {
        setMessage("Admin details not found.");
      }
    } catch (err) {
      console.error(err);
      setMessage("An error occurred. Please try again.");
    }
  };

  return (
    <div className="forgot-password-modal" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2>Reset Password</h2>
        <form onSubmit={handleSubmit}>
          <FloatingInput
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            name="email"
          />
          <div className="modal-buttons">
            <button type="submit">Send Reset Link</button>
            <button type="button" onClick={onClose}>Close</button>
          </div>
        </form>

        {message && (
          <p className={messageType === "success" ? "success-text" : "error-text"}>
            {message}
          </p>
        )}
      </div>
    </div>
  );
};

export default ForgotPasswordModal;
