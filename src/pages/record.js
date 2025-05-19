import React, { useState, useEffect,
   useRef
  , useMemo,} from 'react';
import '../design/users.css';
import axios from 'axios';

const Record = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [records, setRecords] = useState([]);
  const [expandedPatient, setExpandedPatient] = useState(null);
  const baseUrl = 'https://toothpix-backend.onrender.com/api/app/records';
  const [showEditModal, setshowEditModal] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null); 
  const [sortBy, setSortBy] = useState('idpatient');
  const [sortOrder, setSortOrder] = useState('asc');
  const [showAddModal, setShowAddModal] = useState(false);
  const [openSuggestion, setOpenSuggestion] = useState(null); // can be 'patient', 'dentist', or null
   const [messageType, setMessageType] = useState(''); // 'success' or 'error'
          const [message, setMessage] = useState('');
                const [showModal2, setShowModal2] = useState(false);
                  const [showModal, setShowModal] = useState(false);
    
  const [newRecord, setNewRecord] = useState({
    iddentist: '',
    idpatient: '',
    idappointment: '',
    treatment_notes: '',
    paymentstatus: '',
    services: '',
    totalprice: '',
  });
  const initialRecordState = {
    idpatient: selectedRecord?.idpatient || '',
    iddentist: '',        // You may want to set this by default or have a select input
    idappointment: '',
    treatment_notes: '',
    paymentstatus: '',
    services: '',
    totalprice: 0,
  };
  const [editedRecord, setEditedRecord] = useState({});
 const [confirmDeleteId, setConfirmDeleteId] = useState(null); // holds id to delete
              const [confirmMessage, setConfirmMessage] = useState('');

useEffect(() => {
  if (selectedRecord) {
    setEditedRecord({
      treatment_notes: selectedRecord.treatment_notes || '',
      paymentstatus: selectedRecord.paymentstatus || '',
    });
    console.log("Editing Record ID:", selectedRecord.idrecord);
  }
}, [selectedRecord]);

  const paymentStatusOptions = ["Paid", "Unpaid", "Partial"];

  const handleDelete = (idrecord) => {
    setConfirmDeleteId(idrecord);
    setConfirmMessage('Are you sure you want to delete this record?');
    setShowModal(true);
  };
  
   
  
  useEffect(() => {
    fetchRecords();
  }, []);

  const fetchRecords = async () => {
    try {
      const token = localStorage.getItem('jwt_token');
      const response = await axios.get(baseUrl, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setRecords(response.data.records);
    } catch (error) {
    } finally {
      setIsLoading(false);
    }
  };
 
  const confirmDeletion = async () => {
    if (!confirmDeleteId) {
      showTemporaryModal('No record selected for deletion.', 'error');
      setShowModal(false);
      return;
    }
  
    try {
      const response = await fetch(`${baseUrl}/${confirmDeleteId}`, {
        method: 'DELETE',
      });
  
      if (!response.ok) {
        const error = await response.json();
        showTemporaryModal(error.message || 'Failed to delete record.', 'error');
        return;
      }
  
      showTemporaryModal('Record deleted successfully.', 'success');
    } catch (error) {
      console.error("Error deleting record:", error);
      showTemporaryModal('An error occurred while deleting the record.', 'error');
    } finally {
      setConfirmDeleteId(null);
      setShowModal(false);
    }
  };

  const [existingRecordAppointments, setExistingRecordAppointments] = React.useState([]);

React.useEffect(() => {
  if (showAddModal && selectedRecord?.idpatient) {
    fetch(`/api/app/records/appointments/${selectedRecord.idpatient}`)
      .then(res => res.json())
      .then(data => setExistingRecordAppointments(data))
      .catch(err => console.error('Failed to fetch existing record appointments', err));
  } else {
    setExistingRecordAppointments([]);
  }
}, [showAddModal, selectedRecord]);

  
  const handleSortByChange = (e) => setSortBy(e.target.value);
  const handleSortOrderChange = (e) => setSortOrder(e.target.value);

  const uniquePatients = useMemo(() => {
    const seen = new Set();
    const filtered = records.filter((record) => {
      const key = record.patientfullname.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    return [...filtered].sort((a, b) => {
      let fieldA = a[sortBy];
      let fieldB = b[sortBy];

      if (sortBy === 'patientfullname') {
        fieldA = fieldA.toLowerCase();
        fieldB = fieldB.toLowerCase();
      }

      if (fieldA < fieldB) return sortOrder === 'asc' ? -1 : 1;
      if (fieldA > fieldB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  }, [records, sortBy, sortOrder]);

  const fetchAppointmentsByPatient = async (idpatient) => { 
    try {
      setIsLoading(true);

      const response = await axios.get(
        'https://toothpix-backend.onrender.com/api/app/appointments'
      );
  
      const allAppointments = response.data.appointments || [];

      // Filter by patient ID and status = 'completed'
      const filteredAppointments = allAppointments.filter(
        (appointment) =>
          String(appointment.idpatient) === String(idpatient) &&
          appointment.status === 'completed'
      );
      
      
      return filteredAppointments;
  
    } catch (error) {
        showTemporaryModal('Error fetching appointments by patient:', 'error');
      return [];
    } finally {
      setIsLoading(false);
    }
  };
  const showTemporaryModal = (msg, type) => {
    setMessage(msg);
    setMessageType(type);
    setShowModal2(true);
    setTimeout(() => {
      setShowModal2(false);
      setMessage('');
      setMessageType('');
    }, 2000);
  };
  const fetchAppointmentServices = async (idappointment) => {
    try {
      const id = parseInt(idappointment, 10); // Ensure it's an integer
      if (isNaN(id)) {
        throw new Error(`Invalid appointment ID: ${idappointment}`);
      }

      const response = await axios.get(
        `https://toothpix-backend.onrender.com/appointment-services/${id}`
      );
      
      return response.data.services || [];
    } catch (error) {
      console.error("Error fetching appointment services:", error);
      return [];
    }
  };
  const handleCreateRecord = async (e) => {
    e.preventDefault();
  
    const appointments = await fetchAppointmentsByPatient(selectedRecord.idpatient);
  
    // ✅ Find the selected appointment by ID
    const selectedAppointment = appointments.find(
      (appt) => String(appt.idappointment) === String(newRecord.idappointment)
    );
  
    if (!selectedAppointment) {
      showTemporaryModal('Selected appointment not found.', 'error');

      return;
    }
    const idpatient = parseInt(selectedRecord.idpatient, 10); // Ensure it's an integer
    const iddentist = parseInt(selectedAppointment.iddentist, 10); // Ensure it's an integer
    const idappointment = parseInt(newRecord.idappointment, 10); // Ensure it's an integer

    // ✅ Now construct the payload
    const payload = {
      idpatient: idpatient,
      iddentist: iddentist, // ✅ Corrected
      idappointment: idappointment,
      treatment_notes: newRecord.treatment_notes,
      paymentstatus: newRecord.paymentstatus,
    };
  
    console.log("Submitting record to API:", payload);
  
    if (!payload.idpatient || !payload.iddentist || !payload.idappointment) {
        showTemporaryModal('Patient, Dentist, and Appointment are required.', 'error');
      return;
    }
    try {
        const res = await fetch('https://toothpix-backend.onrender.com/api/app/records', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          });
          
      
    
     
        
        if (!res.ok) {
          showTemporaryModal('Failed to create record, record of appointment already exist.', 'error');
          return;
        }
        showTemporaryModal('Record created successfully!', 'success');
        setShowAddModal(false);
        setNewRecord(initialRecordState);
      } catch (error) {
        showTemporaryModal('An error occurred while creating the record.', 'error');
  
    }
      
  };
  
const suggestionRef = useRef(null);

useEffect(() => {
  if (selectedRecord) {
    setEditedRecord({
      treatment_notes: selectedRecord.treatment_notes || '',
      paymentstatus: selectedRecord.paymentstatus || '',
    });
    console.log("Editing Record ID:", selectedRecord.idrecord);
  }
}, [selectedRecord]);

useEffect(() => {
  const handleClickOutside = (event) => {
    if (
      suggestionRef.current &&
      !suggestionRef.current.contains(event.target)
    ) {
      setOpenSuggestion(null);
    }
  };

  document.addEventListener("mousedown", handleClickOutside);
  return () => {
    document.removeEventListener("mousedown", handleClickOutside);
  };
}, []);

  
  const toggleExpanded = (id) => {
    setExpandedPatient(prev => (prev === id ? null : id));
  };

  const getPatientRecords = (idpatient) =>
    records.filter(record => record.idpatient === idpatient);

  return (
    <div className="container py-4">
      <div className="d-flex align-items-center mb-3 gap-4">
        <h2 className="m-0">Record Management</h2>
      </div>

      {isLoading ? (
        <div className="loading-text">Loading...</div>
      ) : (
        <>
          {/* Sort Controls */}
          <div className="filter-controls sort-controls mt-2 mb-3 d-flex gap-3 align-items-center">
            <label htmlFor="sortBy" className="fw-medium m-0">Sort by:</label>
            <select
              id="sortBy"
              value={sortBy}
              onChange={handleSortByChange}
              className="form-select sort-select d-inline-block w-auto"
            >
              <option value="idpatient">Patient ID</option>
              <option value="patientfullname">Patient Name</option>
            </select>

            <label htmlFor="sortOrder" className="fw-medium m-0">Direction:</label>
            <select
              id="sortOrder"
              value={sortOrder}
              onChange={handleSortOrderChange}
              className="form-select sort-select d-inline-block w-auto"
            >
              <option value="asc">Ascending</option>
              <option value="desc">Descending</option>
            </select>
          </div>

          {/* Table */}
          <table className="table table-bordered users-table">
            <thead>
              <tr> 
                <th>Patient ID</th>
                <th>Patient Name</th>
              </tr>
            </thead>
            <tbody>
              {uniquePatients.length === 0 ? (
                <tr>
                  <td colSpan="2" className="text-center">No records found</td>
                </tr>
              ) : (
                uniquePatients.map((patient) => {
                  const isExpanded = expandedPatient === patient.idpatient;
                  const patientDetails = getPatientRecords(patient.idpatient);

                  return (
                    <React.Fragment key={patient.idpatient}>
                      <tr
                        onClick={() => toggleExpanded(patient.idpatient)}
                        style={{ cursor: 'pointer', backgroundColor: isExpanded ? '#f9f9f9' : '' }}
                      >
                        <td>{patient.idpatient}</td>
                        <td>{patient.patientfullname}</td>
                      </tr>
                      {isExpanded && (
                        <tr>
                          <td colSpan="2">
                          <table className="table table-sm mb-0 expanded-inner-table">
  <thead>
  <tr className="patient-header-row">
  <th colSpan="4" style={{ padding: '0.75rem', backgroundColor: '#cde6f7' }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
      <span style={{ color: '#0c5ea3', fontWeight: 'bold', fontSize: '1rem' }}>
        Patient ID: {patient.idpatient} &nbsp;&nbsp;|&nbsp;&nbsp; Name: {patient.patientfullname}
      </span>
      <button
  className="add-user-btn"
  onClick={async () => {
    const appointments = await fetchAppointmentsByPatient(patient.idpatient);
    setSelectedRecord({
      idpatient: patient.idpatient,
      patientfullname: patient.patientfullname,
      appointments,
    });
    setShowAddModal(true);
  }}
>
</button>

    </div>
  </th>
</tr>


    <tr>
      <th>Record ID</th>
      <th>Appointment Date</th>
      <th>Payment Status</th>
      <th> </th>
    </tr>
  </thead>
  <tbody>
                              {patientDetails.filter(rec => rec.idrecord !== null).length === 0 ? (
  <tr>
    <td colSpan="3" className="text-center">No record</td>
  </tr>
) : (
  patientDetails
    .filter((rec) => rec.idrecord !== null)
    .map((rec) => (
        <tr key={rec.idrecord}>
          
        <td>{rec.idrecord}</td>
        <td>
          {(() => {
            const date = new Date(rec.appointmentdate);
            const yyyy = date.getFullYear();
            const mm = String(date.getMonth() + 1).padStart(2, '0');
            const dd = String(date.getDate()).padStart(2, '0');
            let hours = date.getHours();
            const minutes = String(date.getMinutes()).padStart(2, '0');
            const ampm = hours >= 12 ? 'PM' : 'AM';
            hours = hours % 12 || 12;
            return `${yyyy}-${mm}-${dd} ${String(hours).padStart(2, '0')}:${minutes} ${ampm}`;
          })()}
        </td>
        <td>{rec.paymentstatus || 'N/A'}</td>
        <td className="actions-column">
  <button
    className="btn-edit me-2"
    onClick={() => {
      setshowEditModal(true);
      setSelectedRecord(rec);
    }}
  >
    ✏️ Edit
  </button>
  <button className="btn-delete"onClick={() => handleDelete(rec.idrecord)}>
    🗑️ Delete
  </button>
</td>

        
            
      </tr>
    ))
)}


                              </tbody>
                            </table>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </>
      )}

{showEditModal && selectedRecord && (
  <div className="modal-overlay" onClick={() => setshowEditModal(false)}>
    <div className="modal-box" onClick={e => e.stopPropagation()}>
      <h2>Record Information</h2>

      <div className="form-row">
        <div className="form-group">
          <label>Dentist Name</label>
          <input
            type="text"
            className="form-control"
            value={selectedRecord.dentistfullname || 'N/A'}
            readOnly
          />
        </div>

        <div className="form-group">
          <label>Treatment Notes</label>
          <textarea
  className="form-control"
  rows="3"
  name="treatment_notes"
  value={editedRecord.treatment_notes}
  onChange={(e) =>
    setEditedRecord((prev) => ({ ...prev, treatment_notes: e.target.value }))
  }
/>
        </div>

        <div className="form-group usertype-input-wrapper" ref={suggestionRef}>
  <label>Payment Status</label>
  <input
    type="text"
    name="paymentstatus"
    value={editedRecord.paymentstatus}
    onChange={(e) => {
      const value = e.target.value;
      setEditedRecord((prev) => ({ ...prev, paymentstatus: value }));
      setOpenSuggestion("paymentstatus");
    }}
    onFocus={() => setOpenSuggestion("paymentstatus")}
    className="form-control"
    autoComplete="off"
    placeholder="Select Payment Status"
    required
  />

  {openSuggestion === "paymentstatus" && (
    <ul className="suggestions-list">
      {["Paid", "Pending", "Unpaid"]
        .filter((status) =>
          status.toLowerCase().includes(editedRecord.paymentstatus.toLowerCase())
        )
        .map((status, index) => (
          <li
            key={index}
            className="suggestion-item"
            onClick={() => {
              setEditedRecord((prev) => ({ ...prev, paymentstatus: status }));
              setOpenSuggestion(null);
            }}
          >
            {status}
          </li>
        ))}
    </ul>
  )}
</div>

        </div>
        <div className="form-row">
        <div className="form-group">
          <label>Services</label>
          <input
            type="text"
            className="form-control"
            value={selectedRecord.services || 'N/A'}
            readOnly
          />
        </div>

        <div className="form-group">
          <label>Total Price</label>
          <input
            type="text"
            className="form-control"
            value={`₱${selectedRecord.totalprice || '0.00'}`}
            readOnly
          />
        </div>
        </div>
        <button
  onClick={async () => {
    try {
      const res = await fetch(
        `https://toothpix-backend.onrender.com/api/app/records/${selectedRecord.idrecord}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(editedRecord),
        }
      );

      if (!res.ok) {    
        showTemporaryModal('Failed to update record.', 'error');
        return;
      }
      showTemporaryModal('Record updated successfully!.', 'success');
      setshowEditModal(false);
    } catch (err) {
      showTemporaryModal('An error occurred while updating the record.', 'error');

    }
  }}
  className="btn btn-success mt-3"
>
  Save Changes
</button>


      <button onClick={() => setshowEditModal(false)} className="btn btn-primary mt-3">
        Close
      </button>
    </div>
  </div>
)}

{showAddModal && selectedRecord && (
  <div className="modal-overlay" onClick={() => {
    setShowAddModal(false);
    setNewRecord(initialRecordState);
  }}
  >
    <div className="modal-box" onClick={(e) => e.stopPropagation()}>
      <h2>Add Record for {selectedRecord.patientfullname}</h2>
      <form 
      onSubmit={handleCreateRecord}
      >
        <div className='form-row'>
        <div className="form-group">
          <label>Select Appointment</label>
<select
  className="form-control"
  name="idappointment"
  value={newRecord.idappointment}
  onChange={async (e) => {
    const selectedId = e.target.value;
    setNewRecord({ ...newRecord, idappointment: selectedId, services: '', totalprice: '' });

    if (selectedId) {
      try {
        const servicesData = await fetchAppointmentServices(selectedId);
        const serviceNames = servicesData.map(service => service.name);
        const total = servicesData.reduce((sum, service) => sum + Number(service.price), 0);

        setNewRecord(prev => ({
          ...prev,
          services: serviceNames.join(', '),
          totalprice: total
        }));
      } catch (error) {
        console.error('Error fetching services in modal:', error);
      }
    }
  }}
  required
>
<option value="">Select</option>
  {selectedRecord.appointments
    ?.filter(appt => !existingRecordAppointments.includes(appt.idappointment))
    .map(appt => (
      <option key={appt.idappointment} value={appt.idappointment}>
        {new Date(appt.date).toLocaleString()}
      </option>
  ))}
</select>


        </div>
        <div className="form-group">
  <label>Services</label>
  <input
    type="text"
    className="form-control"
    value={newRecord.services}
    readOnly
  />
</div>



<div className="form-group">
  <label>Total Price</label>
  <input
    type="text"
    className="form-control"
    value={`₱${newRecord.totalprice}`}
    readOnly
  />
  <input
    type="hidden"
    name="totalprice"
    value={newRecord.totalprice}
  />
</div>

</div>
<div className='form-row'>
        <div className="form-group">

          <textarea
            className="form-control"
            placeholder='Treatment Notes(Optional)'

            rows="3"
            name="treatment_notes"
            value={newRecord.treatment_notes}
            onChange={(e) => setNewRecord({ ...newRecord, treatment_notes: e.target.value })}
          />
        </div>
        <div className="form-group usertype-input-wrapper">
  <input
    type="text"
    name="paymentstatus"
    value={newRecord.paymentstatus}
    onChange={(e) => {
      const value = e.target.value;
      setNewRecord(prev => ({ ...prev, paymentstatus: value }));
      setOpenSuggestion("paymentstatus");
    }}
    onFocus={() => setOpenSuggestion("paymentstatus")}
    className="form-control"
    autoComplete="off"
    placeholder="Select Payment Status"
    required
  />
  
  {openSuggestion === "paymentstatus" && (
    <ul className="suggestions-list">
      {paymentStatusOptions
        .filter(status =>
          status.toLowerCase().includes(newRecord.paymentstatus.toLowerCase())
        )
        .map((status, index) => (
          <li
            key={index}
            className="suggestion-item"
            onClick={() => {
              setNewRecord(prev => ({ ...prev, paymentstatus: status }));
              setOpenSuggestion(null);
            }}
          >
            {status}
          </li>
        ))}
    </ul>
  )}
</div>

        </div>
        <button type="submit" className="btn btn-success mt-3">Save</button>
        <button
          type="button"
          className="btn btn-secondary mt-3 ms-2"
          onClick={() => {
            setShowAddModal(false);
            setNewRecord(initialRecordState);
          }}
          
        >
          Cancel
        </button>
      </form>
    </div>
  </div>
)}

{showModal && (
    <div className="modal-overlay">
        <div className={`modal-box ${messageType}`}>
        <p>{confirmDeleteId ? confirmMessage : message}</p>
        {confirmDeleteId ? (
            <div style={{ marginTop: '1rem' }}>
            <button className="btn btn-danger me-2" onClick={confirmDeletion}>Yes</button>
            <button className="btn btn-secondary" onClick={() => {
                setShowModal(false);
                setConfirmDeleteId(null);
            }}>Cancel</button>
            </div>
        ) : null}
        </div>
    </div>
    )}
{showModal2 && (
  <div className="modal-overlay">
    <div className={`modal-box ${messageType}`}>
      <p>{message}</p>
    </div>
  </div>
)}
    </div>
  );
};

export default Record;
