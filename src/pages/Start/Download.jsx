import React from "react";
import './Download.css'; // create this CSS file

function Download() {
  return (
    <div className="download-container">
      <h1>Get the Smart Dental App</h1>
      <p>Experience 3D dental visualization, manage appointments, and keep your records safe — all in one app!</p>

      <div className="download-buttons">
        <a href="https://drive.google.com/uc?export=download&id=1maTYnsjtd7mITpMNHpcKSy5YWaKTbD0-" className="download-button">Download</a>
      </div>

      <p className="note">*Available on mobile devices only</p>
    </div>
  );
}

export default Download;
