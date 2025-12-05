import React, { useEffect, useState } from "react";
import "./BeforeModelModal.css";

function BeforeModelModal({ isOpen, onClose, recordId }) {
  const [iframeKey, setIframeKey] = useState(0);

  // Reload iframe each time modal opens
  useEffect(() => {
    if (isOpen && recordId) {
      setIframeKey((prev) => prev + 1);
      console.log("Modal opened, iframeKey:", iframeKey + 1, "recordId:", recordId);
    }
  }, [isOpen, recordId]);

  // ✅ Send both recordId and token to Unity iframe
  useEffect(() => {
    if (!isOpen || !recordId) return;

    const iframe = document.querySelector("iframe");
    if (!iframe) return;

    // 🧠 Use the same key your backend expects:
    const token = localStorage.getItem("adminId");
    

    const sendDataToIframe = () => {
      console.log("🔹 Sending recordId and token to Unity iframe...", recordId);

      // ✅ Send record ID
      iframe.contentWindow.postMessage(
        { type: "SET_RECORD_ID", recordId: String(recordId) },
        "*"
      );

      // ✅ Send token
      if (token) {
        iframe.contentWindow.postMessage(
          { type: "SET_AUTH_TOKEN", token },
          "*"
        );
        console.log("✅ Token sent to Unity iframe");
      } else {
        console.warn("⚠️ No auth token found in localStorage");
      }
    };

    // Wait for iframe to load
    iframe.onload = sendDataToIframe;

    // Also try sending immediately (in case it’s already loaded)
    sendDataToIframe();
  }, [isOpen, recordId, iframeKey]);

  if (!isOpen) return null;

  return (
    
    <div className="modal-backdrop">
      <div className="unity-content">
        <h2 className="unity-title">Before 3D Teeth Editor</h2>
        
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
         <button className="btn-exit" onClick={onClose}>close</button>
       
      </div>
    </div>
  );
}

export default BeforeModelModal;
