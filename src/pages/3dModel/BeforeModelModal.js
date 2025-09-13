import React, { useEffect, useState } from "react";
import "./BeforeModelModal.css";

function BeforeModelModal({ isOpen, onClose, recordId }) {
  const [iframeKey, setIframeKey] = useState(0);

  // Reload iframe each time modal opens
  useEffect(() => {
    if (isOpen && recordId) {
      setIframeKey(prev => prev + 1);
      console.log("Modal opened, iframeKey:", iframeKey + 1, "recordId:", recordId);
    }
  }, [isOpen, recordId]);

  // Send recordId to iframe via postMessage when ready
  useEffect(() => {
    if (!isOpen || !recordId) return;

    const iframe = document.querySelector("iframe");
    if (!iframe) return;

    const sendIdToIframe = () => {
      console.log("Sending recordId to iframe via postMessage:", recordId);
      iframe.contentWindow.postMessage(
        { type: "SET_RECORD_ID", recordId: String(recordId) },
        "*"
      );
    };

    // Wait for iframe to load
    iframe.onload = sendIdToIframe;

    // Also send immediately in case iframe is already loaded
    sendIdToIframe();

  }, [isOpen, recordId, iframeKey]);

  if (!isOpen) return null;

  return (
    <div className="unity-overlay">
      <div className="unity-content">
        <button className="modal-close" onClick={onClose}>×</button>
        <h2>Before 3D Teeth Editor</h2>
        <div className="unity-container">
          {recordId ? (
            <iframe
              key={iframeKey}
              src={`${process.env.PUBLIC_URL}/unity/TeethEditor/index.html`}
              title="Before Editor"
            />
          ) : (
            <p>Loading model...</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default BeforeModelModal;
