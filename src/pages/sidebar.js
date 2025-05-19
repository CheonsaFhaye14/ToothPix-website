import '../design/sidebar.css';
import React from 'react';
import { Link } from 'react-router-dom';  // Import Link for navigation

const Sidebar = () => {
  return (
    <div className="sidebar">
        <h3 className="sidebar-title">ToothPix Admin</h3>
      <ul className="sidebar-nav">
        <li><Link to="/dashboard" className="nav-link">Dashboard</Link></li>
        <li><Link to="/appointments" className="nav-link">Appointments</Link></li> {/* Add link to appointments */}
        <li><Link to="/users" className="nav-link">Users</Link></li>
        <li><Link to="/record" className="nav-link">Record</Link></li>
        <li><Link to="/service" className="nav-link">Service</Link></li>
       </ul>
    </div>
  );
};

export default Sidebar;
