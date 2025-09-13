import React, { useState, useEffect, useRef } from 'react';
import '../../design/users.css';
import axios from 'axios';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import '../../design/record.css'; 
import RecordReportExport from './RecordReportExport';
import '../../design/appointment.css';
import EditAppointmentModal from './EditAppointmentModal';
import AddAppointmentModal from './AddAppointmentModal';
import InfoModal from './InfoModal';
import RecordListTable from './RecordListTable';

dayjs.extend(utc);
dayjs.extend(timezone);

function formatAppointmentDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
}


const Record = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [records, setRecords] = useState([]);
  const [expandedPatient, setExpandedPatient] = useState(null);
  const [dentists, setDentists] = useState([]);
  const [services, setServices] = useState([]);
    const [patients, setPatients] = useState([]);
  const [report, setReport] = useState([]);

   const existingTimes = [
    "09:00 AM", "10:00 AM", "11:00 AM", "12:00 PM",
    "01:00 PM", "02:00 PM", "03:00 PM", "04:00 PM",
    "05:00 PM", "06:00 PM"
  ];

  // Modal states
  const [showInfoModal, setshowInfoModal] = useState(false);
  const [modalAppointment, setModalAppointment] = useState(null);
  const [messageType, setMessageType] = useState('info'); // for modal-box class, e.g. 'info', 'error' etc.
  const [message, setMessage] = useState('');
              const [showModal2, setShowModal2] = useState(false);
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

  //edit

 const [isEditing, setIsEditing] = useState(false);
const [editFormData, setEditFormData] = useState({
  idappointment: "", // ✅ Add this
  patient: "",
  dentist: "",
  date: "",
  time: "",
  serviceInput: "",
  service: [],
  treatment_notes: ""
});

const handleEditFormChange = (e) => {
  const { name, value } = e.target;
  setEditFormData((prev) => ({
    ...prev,
    [name]: value,
  }));
};

const handleEditSubmit = async (e) => {
  e.preventDefault();

  if (!editFormData.dentist.trim()) {
    showTemporaryModal('Dentist is required.', 'error');
    return;
  }
  const isExistingDentist = existingDentist.includes(editFormData.dentist);
  if (!isExistingDentist) {
    showTemporaryModal('Dentist does not exist.', 'error');
    return;
  }

  if (!editFormData.date) {
    showTemporaryModal('Date is required.', 'error');
    return;
  }

  if (!editFormData.time.trim()) {
    showTemporaryModal('Time is required.', 'error');
    return;
  }

  // New validation for time against existingTimes
  if (!existingTimes.includes(editFormData.time)) {
    showTemporaryModal('Time is not in the allowed time slots.', 'error');
    return;
  }

  if (!editFormData.service.length) {
    showTemporaryModal('At least one service must be selected.', 'error');
    return;
  }

  for (const serviceName of editFormData.service) {
    if (!existingService.includes(serviceName)) {
      showTemporaryModal(`Service "${serviceName}" does not exist.`, 'error');
      return;
    }
  }

  const dentistObj = dentists.find(
    (d) => `${d.firstname} ${d.lastname}` === editFormData.dentist
  );
  if (!dentistObj) {
    showTemporaryModal('Dentist not found in records.', 'error');
    return;
  }

  // Parse time (12-hour format) to 24-hour
  const [timePart, modifier] = editFormData.time.split(' ');
  let [hours, minutes] = timePart.split(':').map(Number);
  if (modifier === 'PM' && hours < 12) hours += 12;
  if (modifier === 'AM' && hours === 12) hours = 0;

  // Create local Date object in Manila timezone (UTC+8)
  const [year, month, day] = editFormData.date.split('-').map(Number);
  const localDate = new Date(year, month - 1, day, hours, minutes, 0);

  // Convert to UTC ISO string
  const combinedDateTime = localDate.toISOString();

  const selectedDateTime = new Date(combinedDateTime);
  const now = new Date();

  // Only allow past datetime, reject if selected datetime is in the future
  if (selectedDateTime > now) {
    showTemporaryModal('Selected date and time cannot be in the future.', 'error');
    return;
  }

  const selectedServiceIds = [...new Set(
    editFormData.service
      .map((serviceName) => {
        const serviceObj = services.find((s) => s.name === serviceName);
        return serviceObj ? serviceObj.idservice : null;
      })
      .filter((id) => id !== null)
  )];

  const payload = {
    idappointment: editFormData.idappointment,
    iddentist: dentistObj.idusers,
    date: combinedDateTime, // UTC ISO string sent here
    services: selectedServiceIds,
    treatment_notes: editFormData.treatment_notes || ''
  };
  console.log(payload);

  try {
    const response = await axios.put(
      `https://toothpix-backend.onrender.com/api/website/record/${editFormData.idappointment}`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('jwt_token')}`
        }
      }
    );

    if (response.status === 200) {
      showTemporaryModal('Record updated successfully.', 'success');
      setIsEditing(false);
      setEditFormData({
        idappointment: "",
        patient: "",
        dentist: "",
        date: "",
        time: "",
        serviceInput: "",
        service: [],
        treatment_notes: ""
      });
      fetchRecords(); // Refresh data
      fetchReport();
    }
  } catch (error) {
    if (error.response) {
      const msg = error.response.data.message;
      showTemporaryModal(msg || 'Error occurred while updating.', 'error');
    } else {
      showTemporaryModal('Failed to connect to server.', 'error');
    }
  } finally {
    fetchPatients();
    fetchDentists();
    fetchServices();
    fetchRecords();
    fetchReport();
  }
};






 // suggestion
const [openSuggestion, setOpenSuggestion] = useState(null);
// Use separate refs for each suggestion dropdown
const dentistRef = useRef(null);
const timeRef = useRef(null);
const serviceRef = useRef(null);

useEffect(() => {
  const handleClickOutside = (event) => {
    if (
      (openSuggestion === 'dentist' && dentistRef.current && !dentistRef.current.contains(event.target)) ||
      (openSuggestion === 'time' && timeRef.current && !timeRef.current.contains(event.target)) ||
      (openSuggestion === 'service' && serviceRef.current && !serviceRef.current.contains(event.target))
    ) {
      setOpenSuggestion(null);
    }
  };

  document.addEventListener('mousedown', handleClickOutside);
  return () => {
    document.removeEventListener('mousedown', handleClickOutside);
  };
}, [openSuggestion]);



  
   const existingService = [...new Set(services.map(service => service.name).filter(Boolean))];
  const existingDentist = [
    ...new Set(
      dentists
        .filter(d => d.firstname && d.lastname)
        .map(d => `${d.firstname} ${d.lastname}`)
    ),
  ];
 const existingPatient = [
  ...new Set([
    // Registered patients
    ...patients
      .filter(p => p.firstname && p.lastname)
      .map(p => `${p.firstname} ${p.lastname}`),

    // Walk-in patients from records (patient_name is a full name string)
    ...records
      .filter(app => app && app.patient_name)
      .map(app => app.patient_name)
  ])
];
  const fetchPatients = async () => {
        try {
          const res = await fetch('https://toothpix-backend.onrender.com/api/app/patients');
          const data = await res.json();
          if (res.ok) setPatients(data.patients);
        } catch (error) {
          console.error('Error fetching patients:', error);
        }
      };
   const fetchDentists = async () => {
        try {
          const res = await fetch('https://toothpix-backend.onrender.com/api/app/dentists');
          const data = await res.json();
          if (res.ok) setDentists(data.dentists);
        } catch (error) {
          console.error('Error fetching dentists:', error);
        }
      };
      const fetchServices = async () => {
                try {
                const token = localStorage.getItem('jwt_token');
                const response = await axios.get('https://toothpix-backend.onrender.com/api/app/services', {
                    headers: {
                    Authorization: `Bearer ${token}`,
                    },
                });
                setServices(response.data.services);
                } catch (error) {
                console.error('Error fetching services:', error);
                } finally {
                setIsLoading(false);
                }
            };

  const fetchRecords = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get('https://toothpix-backend.onrender.com/api/website/record');
      setRecords(response.data.records || []);
    } catch (error) {
    } finally {
      setIsLoading(false);
    }
  };
const fetchReport = async () => {
  try {
    setIsLoading(true);
    const response = await axios.get('https://toothpix-backend.onrender.com/api/reports/records');
    setReport(response.data.records || []);
  } catch (error) {
    console.error('Error fetching record report:', error);
  } finally {
    setIsLoading(false);
  }
};


  useEffect(() => {
    fetchRecords();
    fetchDentists();
    fetchPatients();
      fetchServices();
fetchReport();
  }, []);

  //delete
   const [confirmDeleteId, setConfirmDeleteId] = useState(null); // holds id to delete
   const [showModal, setShowModal] = useState(false);
   const [confirmMessage, setConfirmMessage] = useState('');
 const confirmDeletion = async () => {
  if (!confirmDeleteId) {
    showTemporaryModal('No Record selected for deletion.', 'error');
    setShowModal(false);
    return;
  }

  try {
    const response = await fetch(`https://toothpix-backend.onrender.com/api/website/record/${confirmDeleteId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${localStorage.getItem('jwt_token')}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      showTemporaryModal(error.message || 'Failed to delete appointment.', 'error');
      return;
    }

    showTemporaryModal('Appointment deleted successfully.', 'success');
    fetchRecords(); // <-- Reload data here after successful deletion
  fetchReport();
  } catch (error) {
    console.error("Error deleting appointment:", error);
    showTemporaryModal('An error occurred while deleting the appointment.', 'error');
  } finally {
    setConfirmDeleteId(null);
    setShowModal(false);
  }
};
  const handleDelete = (id) => {
    console.log("Deleting ID:", id);
    setConfirmDeleteId(id);
    setMessageType('error');
    setConfirmMessage("Are you sure you want to delete this Record?");
    setShowModal(true);
  };

//add
    const [isAdding, setIsAdding] = React.useState(false);

const [addFormData, setAddFormData] = useState({
  patient: "",
  dentist: "",
  date: "",
  time: "",
  service: [],
  serviceInput: "",
  treatment_notes: "", // <--- New
});
const handleAddFormChange = (e) => {
    const { name, value } = e.target;
    setAddFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };
const handleAddSubmit = async (e) => {
  e.preventDefault();

  const patientName = addFormData.patient.trim();
  const dentistName = addFormData.dentist.trim();

  if (!patientName) {
    showTemporaryModal('Patient is required.', 'error');
    return;
  }

  if (!dentistName) {
    showTemporaryModal('Dentist is required.', 'error');
    return;
  }

  const patientObj = patients.find(
    (p) => `${p.firstname} ${p.lastname}` === patientName
  );
  const dentistObj = dentists.find(
    (d) => `${d.firstname} ${d.lastname}` === dentistName
  );

  if (!dentistObj) {
    showTemporaryModal('Dentist not found in records.', 'error');
    return;
  }

  if (!addFormData.date) {
    showTemporaryModal('Date is required.', 'error');
    return;
  }

  if (!addFormData.time.trim()) {
    showTemporaryModal('Time is required.', 'error');
    return;
  }

  if (!addFormData.service.length) {
    showTemporaryModal('At least one service must be selected.', 'error');
    return;
  }

  for (const serviceName of addFormData.service) {
    if (!existingService.includes(serviceName)) {
      showTemporaryModal(`Service "${serviceName}" does not exist.`, 'error');
      return;
    }
  }

  // Convert 12-hour time to 24-hour format
  const [timePart, modifier] = addFormData.time.split(' ');
  let [hours, minutes] = timePart.split(':').map(Number);
  if (modifier === 'PM' && hours < 12) hours += 12;
  if (modifier === 'AM' && hours === 12) hours = 0;

  // Create local Date object in Manila timezone (UTC+8)
  const [year, month, day] = addFormData.date.split('-').map(Number);
  // month -1 because JS months are 0-indexed
  const localDate = new Date(year, month - 1, day, hours, minutes, 0);

  // Convert local Manila time to UTC ISO string
  const combinedDateTime = localDate.toISOString();

  const selectedDateTime = new Date(combinedDateTime);
  const now = new Date();

  // Only allow past datetime (not future)
  if (selectedDateTime > now) {
    showTemporaryModal('Selected date and time cannot be in the future.', 'error');
    return;
  }

  const selectedServiceIds = [
    ...new Set(
      addFormData.service
        .map((serviceName) => {
          const serviceObj = services.find((s) => s.name === serviceName);
          return serviceObj ? serviceObj.idservice : null;
        })
        .filter((id) => id !== null)
    ),
  ];

  const newAppointment = {
    iddentist: dentistObj.idusers,
    date: combinedDateTime, // UTC ISO string sent here
    services: selectedServiceIds,
    treatment_notes: addFormData.treatment_notes?.trim() || '',
    ...(patientObj
      ? { idpatient: patientObj.idusers }
      : { patient_name: patientName }),
  };

  console.log(newAppointment);

  try {
    const response = await axios.post(
      'https://toothpix-backend.onrender.com/api/website/record',
      newAppointment,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('jwt_token')}`,
        },
      }
    );

    if (response.status === 201) {
      showTemporaryModal('Appointment added successfully.', 'success');
      setRecords((prev) => [...prev, response.data.appointment]);
      setIsAdding(false);
      setAddFormData({
        patient: '',
        dentist: '',
        date: '',
        time: '',
        service: [],
        serviceInput: '',
        treatment_notes: '',
      });
      fetchRecords(); // refresh records to be consistent
 fetchReport();
    }
  } catch (error) {
    if (error.response) {
      const msg = error.response.data.message;
      showTemporaryModal(msg || 'Something went wrong while adding.', 'error');
    } else {
      showTemporaryModal('Failed to connect to the server.', 'error');
    }
  } finally {
    fetchDentists();
    fetchPatients();
    fetchServices();
  }
};



//filters
const [sortKey, setSortKey] = useState(''); // default sort by idusers
const [sortDirection, setSortDirection] = useState('asc');
const [searchTerm, setSearchTerm] = React.useState('');
const [groupBy, setGroupBy] = React.useState('patient'); // or 'dentist'
const uniqueList = Array.from(
  new Set(
    records
      .filter(rec => rec && (groupBy === 'patient' ? rec.patient_name : rec.dentist_name))
      .map(rec =>
        (groupBy === 'patient' ? rec.patient_name : rec.dentist_name).trim().toLowerCase()
      )
  )
);

const filteredList = uniqueList.filter(name =>
  name.includes(searchTerm.toLowerCase())
);
const sortedList = [...filteredList].sort((a, b) => {
  const aRecord = records.find(rec =>
    (groupBy === 'patient' ? rec.patient_name : rec.dentist_name).toLowerCase() === a
  );
  const bRecord = records.find(rec =>
    (groupBy === 'patient' ? rec.patient_name : rec.dentist_name).toLowerCase() === b
  );

  if (sortKey === 'name') {
    const nameA = (groupBy === 'patient' ? aRecord?.patient_name : aRecord?.dentist_name) || '';
    const nameB = (groupBy === 'patient' ? bRecord?.patient_name : bRecord?.dentist_name) || '';
    return sortDirection === 'asc'
      ? nameA.localeCompare(nameB)
      : nameB.localeCompare(nameA);
  } else if (sortKey === 'date') {
    const dateA = new Date(aRecord?.date);
    const dateB = new Date(bRecord?.date);
    return sortDirection === 'asc' ? dateA - dateB : dateB - dateA;
  }

  return 0; // no sorting applied
});


const toggleExpanded = (nameKey) => {
  setExpandedPatient((prev) => (prev === nameKey ? null : nameKey));
};

  const openAppointmentModal = (appt) => {
    setModalAppointment(appt);
    setMessage(''); // reset message if any
    setMessageType('info');
    setshowInfoModal(true);
  };

  const closeModal = () => {
    setshowInfoModal(false);
    setModalAppointment(null);
  };

      

        const [selectedPatientName, setSelectedPatientName] = useState(''); // start empty means all patients
                    
  // Extract unique patient names for the dropdown
  const patientNames = Array.from(new Set(report.map(r => r.patient_name))).filter(Boolean);

  // Filter records by selected patient, or show all if none selected
  const filteredRecords = selectedPatientName
    ? report.filter(r => r.patient_name === selectedPatientName)
    : report;

  return (
    <div className="container py-4">
      <div className="d-flex align-items-center justify-content-between mb-3 flex-wrap gap-3">
        <div className="d-flex align-items-center gap-3">
          <h2 className="m-0">Record Management</h2>
          <button
            className="add-user-btn"
            onClick={() => setIsAdding(true)}
            title="Add Record"
          />
        </div>
      </div>
      {isLoading ? (
        <div className="loading-text">Loading...</div>
      ) : (
       <> <RecordListTable
  searchTerm={searchTerm}
  setSearchTerm={setSearchTerm}
  groupBy={groupBy}
  setGroupBy={setGroupBy}
  sortKey={sortKey}
  setSortKey={setSortKey}
  sortDirection={sortDirection}
  setSortDirection={setSortDirection}
  sortedList={sortedList}
  records={records}
  expandedPatient={expandedPatient}
  toggleExpanded={toggleExpanded}
  openAppointmentModal={openAppointmentModal}
  setEditFormData={setEditFormData}
  setIsEditing={setIsEditing}
  handleDelete={handleDelete}
  formatAppointmentDate={formatAppointmentDate}
/>
</>
      )}

 {showInfoModal && modalAppointment && (
  <InfoModal
    show={true}
    modalAppointment={modalAppointment}
    closeModal={closeModal}
    formatAppointmentDate={formatAppointmentDate}
    messageType={messageType}
  />
)}

 {isAdding && (
  <AddAppointmentModal
    addFormData={addFormData}
    setAddFormData={setAddFormData}
    handleAddFormChange={handleAddFormChange}
    handleAddSubmit={handleAddSubmit}
    existingPatient={existingPatient}
    existingDentist={existingDentist}
    existingTimes={existingTimes}
    existingService={existingService}
    openSuggestion={openSuggestion}
    setOpenSuggestion={setOpenSuggestion}
    showTemporaryModal={showTemporaryModal}
    setIsAdding={setIsAdding}
  />
)}

{isEditing && (
  <EditAppointmentModal
    editFormData={editFormData}
    setEditFormData={setEditFormData}
    handleEditFormChange={handleEditFormChange}
    handleEditSubmit={handleEditSubmit}
    existingDentist={existingDentist}
    existingTimes={existingTimes}
    existingService={existingService}
    openSuggestion={openSuggestion}
    setOpenSuggestion={setOpenSuggestion}
    dentistRef={dentistRef}
    timeRef={timeRef}
    serviceRef={serviceRef}
    showTemporaryModal={showTemporaryModal}
    setIsEditing={setIsEditing}
  />
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
