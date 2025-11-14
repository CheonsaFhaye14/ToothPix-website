import React, { useState, useRef, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import './PublicNavbar.css'; 
import logo from '../../assets/logo.png';

export default function PublicNavbar() {
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const navbarRef = useRef(null); // for detecting outside clicks

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        navbarRef.current && 
        !navbarRef.current.contains(event.target)
      ) {
        setMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <nav 
      className={`public-navbar ${menuOpen ? "active" : ""}`}
      ref={navbarRef}
    >
      <div className="navbar-logo">
        <img src={logo} alt="Dental Clinic Logo" />
        <span>Smart Dental Clinic</span>
      </div>

      <div className="navbar-links">
        <Link 
          to="/" 
          className={location.pathname === "/" ? "active" : ""} 
          onClick={() => setMenuOpen(false)}
        >
          Home
        </Link>

        <Link 
          to="/about" 
          className={location.pathname === "/about" ? "active" : ""} 
          onClick={() => setMenuOpen(false)}
        >
          Learn More
        </Link>

        <Link 
          to="/download" 
          className={location.pathname === "/download" ? "active" : ""} 
          onClick={() => setMenuOpen(false)}
        >
          Download App
        </Link>

        <Link 
          to="/login" 
          className={`login-link ${location.pathname === "/login" ? "active" : ""}`} 
          onClick={() => setMenuOpen(false)}
        >
          Admin Login
        </Link>
      </div>

      <div className="hamburger-menu" onClick={toggleMenu}>
        &#9776;
      </div>
    </nav>
  );
}
