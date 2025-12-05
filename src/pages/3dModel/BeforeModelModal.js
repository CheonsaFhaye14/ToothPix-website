import React, { useEffect, useState } from "react";
import "./BeforeModelModal.css";

function BeforeModelModal({ isOpen, onClose, recordId, patientName, beforeDate }) {
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

    const token = localStorage.getItem("adminId");

    const sendDataToIframe = () => {
      console.log("🔹 Sending record info to Unity iframe", {
        recordId,
        token,
        patientName,
      });

      iframe.contentWindow.postMessage(
        {
          type: "SET_RECORD_INFO",
          recordId: String(recordId),
          token: token || "",
          patientName: patientName || "",
          beforeDate: beforeDate || "",
        },
        "*"
      );
    };

    iframe.onload = sendDataToIframe;
    sendDataToIframe();
  }, [isOpen, recordId, iframeKey, patientName]);


  if (!isOpen) return null;

  return (
    <div className="unity-overlay">
      <div className="unity-content">
        <button className="modal-close" onClick={onClose}>×</button>
        <div className="unity-container">
          {recordId ? (
            <iframe
              key={iframeKey}
              src={`${process.env.PUBLIC_URL}/unity/TeethEditor/index.html`}
              title="Before Editor"
              className="unity-iframe"
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
