import React, { useState } from "react"; 
import { useAdminAuth } from "../../Hooks/Auth/useAdminAuth";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faRightFromBracket } from "@fortawesome/free-solid-svg-icons";
import "./AdminNavbar.css";
import logo from '../../assets/logo.png';
import MessageModal from "../../Components/MessageModal/MessageModal.jsx"; 
import { useNavigate } from "react-router-dom";

export default function AdminNavbar() {
  const { logout } = useAdminAuth();
  const navigate = useNavigate();
  const [showMessage, setShowMessage] = useState(false);
  const [modalText, setModalText] = useState("");

  const handleLogout = () => {
    // show modal immediately
    setShowMessage(true);
    setModalText("Logging out...");
    

    // short delay to let "Logging out..." appear
    setTimeout(() => {
            // update modal text to success
      setModalText("Successfully logged out!");
      logout(); // clear auth
      localStorage.removeItem("adminId");
      localStorage.removeItem("adminUsername");



      // give user time to see success message, then redirect
      setTimeout(() => {
        setShowMessage(false);
        navigate("/login");
      }, 1500); // 1.5s to read message
    }, 1000); // 0.5s "Logging out..." display
  };

  return (
    <nav className="admin-navbar">
      <div className="navbar-logo">
        <img src={logo} alt="Dental Clinic Logo" height="40" />
        <span>Smart Dental Admin Portal</span>
      </div>

      <div className="navbar-actions">
        <button className="logout-btn" onClick={handleLogout}>
          <FontAwesomeIcon icon={faRightFromBracket} className="logout-icon" />
          <span className="logout-text">Logout</span>
        </button>
      </div>

      {showMessage && (
        <MessageModal
          message={modalText}
          type="success"
          onClose={() => setShowMessage(false)}
        />
      )}
    </nav>
  );
}
