import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import dayjs from 'dayjs';
import { BASE_URL } from '../../config';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import EditAppointmentModal from './EditAppointmentModal';
import InfoModal from './InfoModal';
import RecordListTable from './RecordListTable';

import AddModal from '../../Components/AddModal/AddModal';
import { fieldTemplates } from '../../data/FieldTemplates/records.js';
import {useAdminAuth} from '../../Hooks/Auth/useAdminAuth';
import MessageModal from '../../Components/MessageModal/MessageModal.jsx';

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
const [modalOpen, setModalOpen] = useState(false); // modal open/close
const { token, adminId } = useAdminAuth(); // get token from context
const [records, setRecords] = useState([]);

  const [isLoading, setIsLoading] = useState(true);
  const [expandedPatient, setExpandedPatient] = useState(null);
  const [dentists, setDentists] = useState([]);
  const [services, setServices] = useState([]);
  const [patients, setPatients] = useState([]);

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

  // basic validations (keep as you had)
  if (!editFormData.dentist?.trim()) { showTemporaryModal('Dentist is required.', 'error'); return; }
  if (!existingDentist.includes(editFormData.dentist)) { showTemporaryModal('Dentist does not exist.', 'error'); return; }
  if (!editFormData.date) { showTemporaryModal('Date is required.', 'error'); return; }
  if (!editFormData.time?.trim()) { showTemporaryModal('Time is required.', 'error'); return; }
  if (!existingTimes.includes(editFormData.time)) { showTemporaryModal('Time is not in the allowed time slots.', 'error'); return; }
  if (!Array.isArray(editFormData.service) || editFormData.service.length === 0) { showTemporaryModal('At least one service must be selected.', 'error'); return; }

  // map dentist and services to ids
  const dentistObj = dentists.find((d) => `${d.firstname} ${d.lastname}` === editFormData.dentist);
  if (!dentistObj) { showTemporaryModal('Dentist not found in records.', 'error'); return; }

  // parse time (12-hour) and build UTC ISO string
  const [timePart, modifier] = editFormData.time.split(' ');
  let [hours, minutes] = timePart.split(':').map(Number);
  if (modifier === 'PM' && hours < 12) hours += 12;
  if (modifier === 'AM' && hours === 12) hours = 0;
  const [year, month, day] = editFormData.date.split('-').map(Number);
  const localDate = new Date(year, month - 1, day, hours, minutes, 0);
  const combinedDateTime = localDate.toISOString();

  // ensure services are numeric ids and unique
  const selectedServiceIds = [...new Set(
    editFormData.service
      .map((serviceName) => {
        const s = services.find(serv => serv.name === serviceName || String(serv.idservice) === String(serviceName));
        return s ? Number(s.idservice) : null;
      })
      .filter(id => id !== null)
  )];

  if (selectedServiceIds.length === 0) { showTemporaryModal('No valid services selected.', 'error'); return; }

  // build payload matching required shape
  const payload = {
    idappointment: Number(editFormData.idappointment),
    iddentist: Number(dentistObj.idusers),
    date: combinedDateTime,
    services: selectedServiceIds,
    treatment_notes: String(editFormData.treatment_notes || ''),
    adminId
  };

  console.log('PUT payload:', payload);

  try {
    const response = await axios.put(
      `${BASE_URL}/api/website/record/${payload.idappointment}`,
      payload,
      {
          headers: {
          Authorization: `Bearer ${localStorage.getItem('jwt_token')}`,
        },
      }
    );

    console.log('PUT response:', response.data);
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
      await fetchRecords();
    } else {
      showTemporaryModal('Unexpected response while updating.', 'error');
    }
  } catch (error) {
    console.error('PUT /record error:', error?.response || error);
    const serverMsg = error?.response?.data?.message || JSON.stringify(error?.response?.data) || error.message;
    showTemporaryModal(serverMsg || 'Error occurred while updating.', 'error');
  } finally {
    // refresh lookups
    fetchPatients();
    fetchDentists();
    fetchServices();
    fetchRecords();
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



const fetchPatients = async () => {
  try {
    const res = await fetch(`${BASE_URL}/api/website/patients`);
    const data = await res.json();
    if (res.ok) {
      setPatients(data.patients); // patients array from backend
    } else {
      console.error('Failed to fetch patients:', data.message);
    }
  } catch (error) {
    console.error('Error fetching patients:', error);
  }
};

   const fetchDentists = async () => {
        try {
          const res = await fetch(`${BASE_URL}/api/app/dentists`);
          const data = await res.json();
          if (res.ok) setDentists(data.dentists);
        } catch (error) {
          console.error('Error fetching dentists:', error);
        }
      };
      const fetchServices = async () => {
                try {
                const token = localStorage.getItem('jwt_token');
                const response = await axios.get(`${BASE_URL}/api/website/services`, {
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
      const response = await axios.get(`${BASE_URL}/api/website/record`);
      setRecords(response.data.records || []);
    } catch (error) {
    } finally {
      setIsLoading(false);
    }
  };



  useEffect(() => {
    fetchRecords();
    fetchDentists();
    fetchPatients();
      fetchServices();
  }, []);

  
  
   const existingService = [...new Set(services.map(service => service.name).filter(Boolean))];
  const existingDentist = [
    ...new Set(
      dentists
        .filter(d => d.firstname && d.lastname)
        .map(d => `${d.firstname} ${d.lastname}`)
    ),
  ];
  
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
    const response = await fetch(`${BASE_URL}/api/website/record/${confirmDeleteId}`, {
      method: 'DELETE',
       headers: {
        Authorization: `Bearer ${localStorage.getItem('jwt_token')}`,
        'Content-Type': 'application/json',
      },
        body: JSON.stringify({
        adminId: localStorage.getItem('adminId') // <-- send adminId here
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      showTemporaryModal(error.message || 'Failed to delete record.', 'error');
      return;
    }

    showTemporaryModal('Record deleted successfully.', 'success');
    fetchRecords(); // <-- Reload data here after successful deletion
  } catch (error) {
    console.error("Error deleting record:", error);
    showTemporaryModal('An error occurred while deleting the record.', 'error');
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

// Build dynamic record fields using existing patients, dentists, and services
const fieldsWithRecords = {
  ...fieldTemplates,
  Records: (fieldTemplates.Records || []).map(field => {

    // 1️⃣ Patient dropdown
    if (field.name === "patient") {
      // Use patients array directly
      const patientOptions = (patients || []).map(p => ({
        label: p.fullname,
        value: p.idusers ? p.idusers : p.fullname
      }));

      // Deduplicate by label (case-insensitive)
      const uniquePatientOptions = Array.from(
        new Map(patientOptions.map(opt => [opt.label.toLowerCase(), opt])).values()
      );

      return { ...field, options: uniquePatientOptions };
    }

    // 2️⃣ Dentist dropdown
    if (field.name === "dentist") {
      const dentistOptions = (dentists || [])
        .filter(d => d.firstname && d.lastname)
        .map(d => ({
          label: `${d.firstname} ${d.lastname}`,
          value: d.idusers,
        }));

      const uniqueDentistOptions = Array.from(
        new Map(dentistOptions.map(opt => [opt.label.toLowerCase(), opt])).values()
      );

      return { ...field, options: uniqueDentistOptions };
    }

    // 3️⃣ Services multi-select
    if (field.name === "services") {
      const serviceOptions = (services || [])
        .filter(s => s.name && s.idservice)
        .map(s => ({
          label: s.name,
          value: s.idservice,
        }));

      const uniqueServiceOptions = Array.from(
        new Map(serviceOptions.map(opt => [opt.value, opt])).values()
      );

      return { ...field, options: uniqueServiceOptions };
    }

    // Other fields unchanged
    return field;
  })
};





const handleAdd = async (formValues) => {
  if (!token || !adminId) {
    setMessage({ type: "error", text: "You must be logged in as admin." });
    setTimeout(() => setMessage(null), 2000);
    return;
  }

  try {
    console.log("📝 Original Form Values:", formValues);

    // Build payload as JSON
    const payload = {
      adminId,
      status: "completed", // default status for Records
    };

    // Convert date + time to UTC ISO
    if (formValues.date && formValues.time) {
      const [hours, minutes] = formValues.time.split(":").map(Number);
      const manilaStr = `${formValues.date}T${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:00+08:00`;
      const dateObj = new Date(manilaStr);

      if (isNaN(dateObj)) {
        setMessage({ type: "error", text: "Invalid date or time." });
        setTimeout(() => setMessage(null), 2000);
        return;
      }

      payload.date = dateObj.toISOString();
    }

    // Handle patient
    if (formValues.patient !== undefined && formValues.patient !== null) {
      if (!isNaN(formValues.patient)) {
        payload.idpatient = Number(formValues.patient);
      } else {
        payload.patient_name = formValues.patient;
      }
    }

    // Handle dentist
    if (formValues.dentist !== undefined && formValues.dentist !== null) {
      payload.iddentist = Number(formValues.dentist);
    }

    // Handle services (array of numeric IDs)
    if (Array.isArray(formValues.services)) {
      const serviceIds = formValues.services
        .map((s) => Number(s))
        .filter((id) => !isNaN(id));
      if (serviceIds.length > 0) payload.services = serviceIds;
    }

    // Append other fields except patient/dentist/date/time/services
    Object.entries(formValues).forEach(([key, value]) => {
      if (
        value !== null &&
        value !== "" &&
        value !== undefined &&
        !["patient", "dentist", "date", "time", "services", "Records"].includes(key)
      ) {
        payload[key] = value;
      }
    });

    console.log("🧹 Payload ready:", payload);

    // Send request as JSON
    const response = await axios.post(`${BASE_URL}/api/website/record`, payload, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (response.status === 201) {
      await fetchServices();
      await fetchDentists();
      await fetchPatients();
      await fetchRecords();
      setMessage({ type: "success", text: `✅ ${formValues.records || "Record"} added successfully!` });
      setModalOpen(false);
      setTimeout(() => setMessage(null), 2000);
    } else {
      setMessage({ type: "error", text: response.data?.message || "Something went wrong." });
      setTimeout(() => setMessage(null), 2000);
    }
  } catch (error) {
    console.error("handleAdd error:", error);

    let messageText = "Could not connect to server. Please try again later.";
    if (error.response) {
      const { status, data } = error.response;
      if (status === 400) messageText = "Missing or invalid input fields.";
      else if (status === 500) messageText = "Internal server error occurred.";
      else messageText = data?.message || messageText;
    }

    setMessage({ type: "error", text: messageText });
    setTimeout(() => setMessage(null), 2000);
  }
};



          

  return (
    <div className="container py-4">
      <div className="d-flex align-items-center justify-content-between mb-3 flex-wrap gap-3">
        <div className="d-flex align-items-center gap-3">
          <div className="same-row">
<h1>Record Management</h1>
<button className="btn-add" onClick={() => setModalOpen(true)}>+</button>
  </div>
        </div>
      </div>
      {isLoading ? (
        <div className="loading-text">Loading...</div>
      ) : (
       <> 
       <RecordListTable
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

{modalOpen && (
  <AddModal
    datatype="Records"             // for submission data
    choices={["Records"]}       // minimal default choice
    selected="Records"           // default active type
    fields={fieldsWithRecords}      // object: { Default: [...] }
    onClose={() => setModalOpen(false)}
    onSubmit={handleAdd}
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

 {message && (
        <MessageModal
          message={message.text}
          type={message.type}
          onClose={() => setMessage(null)}
        />
      )}

    </div>
  );
};

export default Record;
