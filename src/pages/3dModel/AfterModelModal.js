import React from 'react';

const AfterModelModal = ({ onClose }) => (
  <div style={styles.modalOverlay} onClick={onClose}>
    <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
      <h3 style={styles.header}>After 3D Model</h3>
      <div style={styles.modelBox}> </div>
      <button className="btn-cancel" onClick={onClose} style={styles.closeButton}>
        Close
      </button>
    </div>
  </div>
);

export default AfterModelModal;

const styles = {
  modalOverlay: {
    position: 'fixed',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    display: 'flex', justifyContent: 'center', alignItems: 'center',
    zIndex: 1000,
  },
  modalContent: {
    backgroundColor: '#e6f0ff',       // light blue background
    padding: '2.5rem',
    borderRadius: '16px',
    width: '90%',
    maxWidth: '650px',
    textAlign: 'center',
    boxShadow: '0 8px 24px rgba(135, 206, 250, 0.4)', // sky blue shadow
    fontFamily: "'Comic Sans MS', cursive, sans-serif",
  },
  header: {
    color: '#3399ff',                 // blue header text
    marginBottom: '1.5rem',
    fontWeight: '700',
    fontSize: '1.8rem',
  },
  modelBox: {
    border: '3px dashed #3399ff',     // blue dashed border
    height: 300,
    borderRadius: '12px',
    backgroundColor: '#d0e7ff',       // lighter blue background for box
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '600',
    fontSize: '1.5rem',
    color: '#3399ff',
    letterSpacing: '1px',
    userSelect: 'none',
  },
  closeButton: {
    backgroundColor: '#3399ff',
    borderColor: '#3399ff',
    fontWeight: '600',
    fontSize: '1rem',
    padding: '0.5rem 1.5rem',
    borderRadius: '50px',
    transition: 'background-color 0.3s ease',
    cursor: 'pointer',
  },
};
