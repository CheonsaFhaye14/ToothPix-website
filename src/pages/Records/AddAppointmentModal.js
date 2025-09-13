import React from 'react';

export default function AddAppointmentModal({
  // REMOVE isAdding here
  setIsAdding,
  addFormData,
  setAddFormData,
  handleAddFormChange,
  handleAddSubmit,
  existingPatient,
  existingDentist,
  existingTimes,
  existingService,
  openSuggestion,
  setOpenSuggestion,
  showTemporaryModal
}) {
  return (
    <div className="modal-overlay">
      <div className="modal-box">
        <h2>Add New Record</h2>

        <form onSubmit={handleAddSubmit}>
                 <div className="form-row">
          {/* PATIENT INPUT */}
          <div className="form-group usertype-input-wrapper">
            <input
              type="text"
              name="patient"
              placeholder="Select Patient"
              value={addFormData.patient}
              onChange={(e) => {
                const value = e.target.value;
                setAddFormData(prev => ({ ...prev, patient: value }));
                setOpenSuggestion('patient');
              }}
              onFocus={() => setOpenSuggestion('patient')}
              className="form-control"
              autoComplete="off"
            />
            {openSuggestion === 'patient' && (
              <ul className="suggestions-list">
                {existingPatient
                  .filter(cat => cat.toLowerCase().includes(addFormData.patient.toLowerCase()))
                  .map((cat, index) => (
                    <li
                      key={index}
                      className="suggestion-item"
                      onClick={() => {
                        setAddFormData(prev => ({ ...prev, patient: cat }));
                        setOpenSuggestion(null);
                      }}
                    >
                      {cat}
                    </li>
                  ))}
              </ul>
            )}
          </div>

          {/* DENTIST INPUT */}
          <div className="form-group usertype-input-wrapper">
            <input
              type="text"
              name="dentist"
              placeholder="Select Dentist"
              value={addFormData.dentist}
              onChange={(e) => {
                const value = e.target.value;
                setAddFormData(prev => ({ ...prev, dentist: value }));
                setOpenSuggestion('dentist');
              }}
              onFocus={() => setOpenSuggestion('dentist')}
              className="form-control"
              autoComplete="off"
            />
            {openSuggestion === 'dentist' && (
              <ul className="suggestions-list">
                {existingDentist
                  .filter(cat => cat.toLowerCase().includes(addFormData.dentist.toLowerCase()))
                  .map((cat, index) => (
                    <li
                      key={index}
                      className="suggestion-item"
                      onClick={() => {
                        setAddFormData(prev => ({ ...prev, dentist: cat }));
                        setOpenSuggestion(null);
                      }}
                    >
                      {cat}
                    </li>
                  ))}
              </ul>
            )}
          </div>
</div>
<div className="form-row">
          {/* DATE INPUT */}
          <div className="form-group">
            <input
              type="date"
              name="date"
              value={addFormData.date}
              onChange={handleAddFormChange}
              className="form-control"
              max={new Date().toISOString().split("T")[0]}
            />
          </div>

          {/* TIME INPUT */}
          <div className="form-group usertype-input-wrapper">
            <input
              type="text"
              name="time"
              placeholder="Select Time"
              value={addFormData.time}
              onChange={(e) => {
                const value = e.target.value;
                setAddFormData(prev => ({ ...prev, time: value }));
                setOpenSuggestion("time");
              }}
              onFocus={() => setOpenSuggestion("time")}
              className="form-control"
              autoComplete="off"
            />
            {openSuggestion === "time" && (
              <ul className="suggestions-list">
                {existingTimes
                  .filter(t => t.toLowerCase().includes(addFormData.time.toLowerCase()))
                  .map((t, index) => (
                    <li
                      key={index}
                      className="suggestion-item"
                      onClick={() => {
                        setAddFormData(prev => ({ ...prev, time: t }));
                        setOpenSuggestion(null);
                      }}
                    >
                      {t}
                    </li>
                  ))}
              </ul>
            )}
          </div>

          {/* SERVICE INPUT */}
          <div className="form-group usertype-input-wrapper">
            <div className="input-and-tags-wrapper">
              <input
                type="text"
                name="service"
                placeholder="Select Service"
                value={addFormData.serviceInput || ''}
                onChange={(e) => {
                  setAddFormData(prev => ({
                    ...prev,
                    serviceInput: e.target.value,
                  }));
                  setOpenSuggestion('service');
                }}
                onFocus={() => setOpenSuggestion('service')}
                className="form-control"
                autoComplete="off"
              />
            </div>
            {openSuggestion === 'service' && (
              <ul className="suggestions-list">
                {existingService
                  .filter(serviceName =>
                    serviceName.toLowerCase().includes((addFormData.serviceInput || '').toLowerCase()) &&
                    !addFormData.service.includes(serviceName)
                  )
                  .map((serviceName, index) => (
                    <li
                      key={index}
                      className="suggestion-item"
                      onClick={() => {
                        if (addFormData.service.length < 3) {
                          setAddFormData(prev => ({
                            ...prev,
                            service: [...prev.service, serviceName],
                            serviceInput: '',
                          }));
                          setOpenSuggestion(null);
                        } else {
                          showTemporaryModal('You can only select up to 3 services.', 'error');
                        }
                      }}
                    >
                      {serviceName}
                    </li>
                  ))}
              </ul>
            )}
          </div>
</div>
          {/* SELECTED SERVICE TAGS */}
          <div className="selected-services">
            {(addFormData.service || []).map((serviceName, idx) => (
              <span key={idx} className="service-tag">
                {serviceName}
                <button
                  type="button"
                  onClick={() => {
                    setAddFormData(prev => ({
                      ...prev,
                      service: prev.service.filter(s => s !== serviceName),
                    }));
                  }}
                >
                  &times;
                </button>
              </span>
            ))}
          </div>

          {/* ACTION BUTTONS */}
          <div className="form-actions">
            <button type="submit" className="btn btn-primary">Add Appointment</button>
            <button type="button" onClick={() => setIsAdding(false)} className="btn btn-secondary">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}
