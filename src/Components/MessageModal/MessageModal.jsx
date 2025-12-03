import React, { useEffect } from "react";
import "./MessageModal.css";

function MessageModal({ message, type = "info", onClose }) {
  useEffect(() => {
    if (message) {
      const timer = setTimeout(onClose, 2000);
      return () => clearTimeout(timer);
    }
  }, [message, onClose]);

  if (!message) return null;

  return (
    <div className="message-overlay">
      <div className={`message-modal ${type}`}>
        <p>{message}</p>
      </div>
    </div>
  );
}

export default MessageModal;
