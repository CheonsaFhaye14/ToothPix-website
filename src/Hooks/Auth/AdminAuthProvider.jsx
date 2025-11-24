import React, { useState, useEffect } from "react";
import { AdminAuthContext } from "./AdminAuthContext";

export function AdminAuthProvider({ children }) {
  // Load auth data from localStorage once
  const [auth, setAuth] = useState(() => ({
    token: localStorage.getItem("adminToken"),
    adminId: localStorage.getItem("adminId"),
    adminUsername: localStorage.getItem("adminUsername"),
  }));

  /** LOGIN — store all credentials */
  const login = (token, adminId, adminUsername) => {
    localStorage.setItem("adminToken", token);
    localStorage.setItem("adminId", adminId);
    localStorage.setItem("adminUsername", adminUsername);

    setAuth({ token, adminId, adminUsername });
  };

  /** LOGOUT — clear all stored auth info */
  const logout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminId");
    localStorage.removeItem("adminUsername");

    setAuth({
      token: null,
      adminId: null,
      adminUsername: null,
    });
  };

  /** Sync when localStorage changes (for safety) */
  useEffect(() => {
    const handleStorageChange = () => {
      setAuth({
        token: localStorage.getItem("adminToken"),
        adminId: localStorage.getItem("adminId"),
        adminUsername: localStorage.getItem("adminUsername"),
      });
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  return (
    <AdminAuthContext.Provider value={{ ...auth, login, logout }}>
      {children}
    </AdminAuthContext.Provider>
  );
}
