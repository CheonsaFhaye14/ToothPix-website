import React from "react";
import AdminNavbar from "./AdminNavbar";
import AdminSidebar from "./AdminSidebar";
import "./AdminLayout.css";

export default function AdminLayout({ children }) {
  return (
    <div className="admin-layout">
        <AdminNavbar />
      <AdminSidebar />
      
      <main className="admin-content">
        {children}
      </main>
    </div>
  );
}
