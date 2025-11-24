import React from "react";
import { useAdminAuth } from "../../Hooks/Auth/useAdminAuth";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faRightFromBracket } from "@fortawesome/free-solid-svg-icons";
import "./AdminNavbar.css";
import logo from '../../assets/logo.png';

export default function AdminNavbar() {
  const { logout } = useAdminAuth();

  const handleLogout = () => {
    logout();
    localStorage.removeItem("adminId");
    localStorage.removeItem("adminUsername");
    window.location.href = "#/login";
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
    </nav>
  );
}
