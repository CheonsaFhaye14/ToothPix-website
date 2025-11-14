// AdminSidebar.jsx
import React from "react";
import { NavLink } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHome,
  faUsers,
  faBriefcase,
  faCalendarCheck,
  faFileAlt,
  faMoneyCheckDollar,
  faCube,
  faListAlt
} from "@fortawesome/free-solid-svg-icons";
import "./AdminSidebar.css";

export default function AdminSidebar() {
  return (
    <aside className="admin-sidebar">
      <div className="sidebar-header"></div>
      <nav className="sidebar-nav">
        <NavLink to="/dashboard" className="sidebar-link">
          <FontAwesomeIcon icon={faHome} className="sidebar-icon" />
          <span className="sidebar-text">Dashboard</span>
        </NavLink>

        <NavLink to="/users" className="sidebar-link">
          <FontAwesomeIcon icon={faUsers} className="sidebar-icon" />
          <span className="sidebar-text">Users</span>
        </NavLink>

        <NavLink to="/service" className="sidebar-link">
          <FontAwesomeIcon icon={faBriefcase} className="sidebar-icon" />
          <span className="sidebar-text">Services</span>
        </NavLink>

        <NavLink to="/appointments" className="sidebar-link">
          <FontAwesomeIcon icon={faCalendarCheck} className="sidebar-icon" />
          <span className="sidebar-text">Appointments</span>
        </NavLink>

        <NavLink to="/record" className="sidebar-link">
          <FontAwesomeIcon icon={faFileAlt} className="sidebar-icon" />
          <span className="sidebar-text">Records</span>
        </NavLink>

        <NavLink to="/payment" className="sidebar-link">
          <FontAwesomeIcon icon={faMoneyCheckDollar} className="sidebar-icon" />
          <span className="sidebar-text">Payments</span>
        </NavLink>

        <NavLink to="/3dmodel" className="sidebar-link">
          <FontAwesomeIcon icon={faCube} className="sidebar-icon" />
          <span className="sidebar-text">3D Models</span>
        </NavLink>

        <NavLink to="/activitylog" className="sidebar-link">
          <FontAwesomeIcon icon={faListAlt} className="sidebar-icon" />
          <span className="sidebar-text">Activity Logs</span>
        </NavLink>
      </nav>
    </aside>
  );
}
