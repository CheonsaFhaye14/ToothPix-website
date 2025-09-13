import React from 'react';

export default function EditAppointmentModal({
  editFormData,
  setEditFormData,
  handleEditFormChange,
  handleEditSubmit,
  existingDentist,
  existingTimes,
  existingService,
  openSuggestion,
  setOpenSuggestion,
  dentistRef,
  timeRef,
  serviceRef,
  showTemporaryModal,
  setIsEditing
}) {
  return (
    <div className="modal-overlay">
      <div className="modal-box">
        <h2>Edit {editFormData.patient} Record</h2>
        <form onSubmit={handleEditSubmit}>
          <div className="form-row">
            <div className="form-group usertype-input-wrapper">
              <label>Dentist</label>
              <input
                type="text"
                name="dentist"
                placeholder="Select Dentist"
                value={editFormData.dentist}
                onChange={handleEditFormChange}
                onFocus={() => setOpenSuggestion("dentist")}
                className="form-control"
                autoComplete="off"
              />
              {openSuggestion === "dentist" && (
                <ul className="suggestions-list-edit" ref={dentistRef}>
                  {existingDentist
                    .filter(dentist =>
                      dentist.toLowerCase().includes(editFormData.dentist.toLowerCase())
                    )
                    .map((dentist, i) => (
                      <li
                        key={i}
                        onClick={() => {
                          setEditFormData((prev) => ({ ...prev, dentist }));
                          setOpenSuggestion(null);
                        }}
                        className="suggestion-item"
                      >
                        {dentist}
                      </li>
                    ))}
                </ul>
              )}
            </div>

            <div className="form-group">
              <label>Date</label>
              <input
                type="date"
                name="date"
                value={editFormData.date}
                onChange={handleEditFormChange}
                className="form-control"
                max={new Date().toISOString().split("T")[0]}
              />
            </div>

            <div className="form-group usertype-input-wrapper">
              <label>Time</label>
              <input
                type="text"
                name="time"
                placeholder="Select Time"
                value={editFormData.time}
                onChange={handleEditFormChange}
                onFocus={() => setOpenSuggestion("time")}
                className="form-control"
                autoComplete="off"
              />
              {openSuggestion === "time" && (
                <ul className="suggestions-list-edit" ref={timeRef}>
                  {existingTimes
                    .filter(t =>
                      t.toLowerCase().includes(editFormData.time.toLowerCase())
                    )
                    .map((t, i) => (
                      <li
                        key={i}
                        onClick={() => {
                          setEditFormData((prev) => ({ ...prev, time: t }));
                          setOpenSuggestion(null);
                        }}
                        className="suggestion-item"
                      >
                        {t}
                      </li>
                    ))}
                </ul>
              )}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group usertype-input-wrapper">
              <label>Services</label>
              <div className="input-and-tags-wrapper">
                <input
                  type="text"
                  name="serviceInput"
                  placeholder="Select Service"
                  value={editFormData.serviceInput || ''}
                  onChange={(e) => {
                    setEditFormData(prev => ({
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
                <ul className="suggestions-list-edit" ref={serviceRef}>
                  {existingService
                    .filter(serviceName =>
                      serviceName.toLowerCase().includes((editFormData.serviceInput || '').toLowerCase()) &&
                      !editFormData.service.includes(serviceName)
                    )
                    .map((serviceName, index) => (
                      <li
                        key={index}
                        className="suggestion-item"
                        onClick={() => {
                          if (editFormData.service.length < 3) {
                            setEditFormData(prev => ({
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

              <div className="selected-services">
                {(editFormData.service || []).map((serviceName, idx) => (
                  <span key={idx} className="service-tagedit">
                    {serviceName}
                    <button
                      type="button"
                      onClick={() => {
                        setEditFormData(prev => ({
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

              <div className="form-group">
                <label>Treatment Notes</label>
                <textarea
                  name="treatment_notes"
                  value={editFormData.treatment_notes}
                  onChange={handleEditFormChange}
                  placeholder="(Optional)"
                  className="form-control"
                />
              </div>
            </div>
          </div>

          <div className="form-actions">
            <button type="submit" className="btn btn-primary">
              Save Changes
            </button>
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="btn btn-secondary"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
