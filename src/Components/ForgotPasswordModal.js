import { useState } from "react"; 
import { BASE_URL } from "../config";
import FloatingInput from "../utils/InputForm";
import MessageModal from "../Components/MessageModal/MessageModal.jsx"; // import the modal
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner } from "@fortawesome/free-solid-svg-icons";
import "./ForgotPasswordModal.css";

const ForgotPasswordModal = ({ onClose }) => {
  const [email, setEmail] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [loading, setLoading] = useState(false); // loading state

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");
    setShowSuccessModal(false);
    setLoading(true);

    if (!email.trim()) {
      setErrorMessage("Please enter your email.");
      setLoading(false);
      return;
    }

    if (!validateEmail(email)) {
      setErrorMessage("Please enter a valid email address.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`${BASE_URL}/api/admin`);
      const data = await res.json();

      if (!res.ok) {
        setErrorMessage("Admin details not found.");
        setLoading(false);
        return;
      }

      const adminEmails = data.admin.map((admin) => admin.email.toLowerCase());
      if (!adminEmails.includes(email.toLowerCase())) {
        setErrorMessage("Email does not match any admin account.");
        setLoading(false);
        return;
      }

      const resetRes = await fetch(`${BASE_URL}/api/request-reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const resetData = await resetRes.json();

      if (resetRes.ok) {
        setSuccessMessage("Password reset link sent to your email!");
        setShowSuccessModal(true);

        setTimeout(() => {
          setShowSuccessModal(false);
          onClose();
        }, 2000);
      } else {
        setErrorMessage(resetData.message || "Error sending reset link.");
      }
    } catch (err) {
      console.error(err);
      setErrorMessage("An error occurred. Please try again.");
    } finally {
      setLoading(false);
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
          <div className="reset-buttons">
            <button type="submit" className="btn-submit" disabled={loading}>
              {loading ? (
                <>
                  <FontAwesomeIcon icon={faSpinner} spin />
                  <span style={{ marginLeft: "8px" }}>Sending...</span>
                </>
              ) : (
                "Send"
              )}
            </button>
            <button type="button" className="btn-cancel" onClick={onClose} disabled={loading}>
              Close
            </button>
          </div>
        </form>

        {/* Inline error message */}
        {errorMessage && <p className="error-text">{errorMessage}</p>}
      </div>

      {/* Success modal */}
      {showSuccessModal && (
        <MessageModal
          message={successMessage}
          type="success"
          onClose={() => setShowSuccessModal(false)}
        />
      )}
    </div>
  );
};

export default ForgotPasswordModal;
