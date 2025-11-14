import React from "react"; 
import PublicNavbar from "./PublicNavbar"; 
import './PublicLayout.css'; 

export default function PublicLayout({ children }) {
  return (
    <div className="public-layout">
      {/* Navbar at the top */}
      <PublicNavbar />

      {/* Page content */}
      <main className="public-content">
        {children}
      </main>

      {/* Footer with contact info */}
      <footer className="public-footer">
        <div className="footer-content">
          <p>&copy; {new Date().getFullYear()} Smart Dental Clinic. All rights reserved.</p>
          <p>Contact Us: <a href="mailto:info@toothpix.com">toothpixo0o@gmail.com</a></p>
        </div>
      </footer>
    </div>
  );
}
