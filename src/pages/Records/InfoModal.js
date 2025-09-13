import React from 'react';

export default function InfoModal({ 
  show, 
  modalAppointment, 
  closeModal, 
  formatAppointmentDate, 
  messageType 
}) {
  if (!show || !modalAppointment) return null;

  return (
    <div className="modal-overlay" onClick={closeModal}>
      <div 
        className={`modal-box ${messageType} info-modal`} 
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="modal-title">Record Information</h2>

        <div className="modal-info-grid">
          <div className="modal-info-row">
            <span className="label">Patient:</span>
            <span>{modalAppointment.patient_name}</span>
          </div>
          <div className="modal-info-row">
            <span className="label">Dentist:</span>
            <span>{modalAppointment.dentist_name}</span>
          </div>
          <div className="modal-info-row">
            <span className="label">Date:</span>
            <span>{formatAppointmentDate(modalAppointment.date)}</span>
          </div>
          <div className="modal-info-row">
            <span className="label">Service:</span>
            <span>{modalAppointment.services}</span>
          </div>
          <div className="modal-info-row">
            <span className="label">Total Price:</span>
            <span>₱{modalAppointment.total_price}</span>
          </div>
          {modalAppointment.treatment_notes && (
            <div className="notes-section">
              <span className="label">Treatment Notes:</span>
              <div className="notes-box">{modalAppointment.treatment_notes}</div>
            </div>
          )}
        </div>

        <button className="modal-close-button" onClick={closeModal}>Close</button>
      </div>
    </div>
  );
}
