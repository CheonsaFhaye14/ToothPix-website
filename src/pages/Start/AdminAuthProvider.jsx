import React, { useState, useEffect } from "react";
import { AdminAuthContext } from "./AdminAuthContext";

export function AdminAuthProvider({ children }) {
  // Initialize token from localStorage only once
  const [token, setToken] = useState(() => localStorage.getItem("adminToken"));

  // Login: save token to localStorage and state
  const login = (newToken) => {
    localStorage.setItem("adminToken", newToken);
    setToken(newToken);
  };

  // Logout: remove token and clear state
  const logout = () => {
    localStorage.removeItem("adminToken");
    setToken(null);
  };

  // Sync token if localStorage changes externally (rare but safer)
  useEffect(() => {
    const handleStorageChange = () => {
      const stored = localStorage.getItem("adminToken");
      setToken(stored);
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  return (
    <AdminAuthContext.Provider value={{ token, login, logout }}>
      {children}
    </AdminAuthContext.Provider>
  );
}
