import React, { useState, useEffect } from 'react'; 
import axios from 'axios';
import AppointmentReportExport from './AppointmentReportExport';
import { BASE_URL } from '../../config';

import AddModal from '../../Components/AddModal/AddModal';
import { fieldTemplates } from '../../data/FieldTemplates/appointments.js';
import {useAdminAuth} from '../../Hooks/Auth/useAdminAuth';
import Table from '../../Components/Table/Table.jsx';
import { showInfoFields } from '../../data/ShowInfoField/appointments.js';
import { formatDateTime } from '../../utils/formatDateTime.jsx';
import AppointmentCalendar from '../../Components/AppointmentCalendar/calendar.js';
import MessageModal from '../../Components/MessageModal/MessageModal.jsx';

const Appointment = () => {
const [modalOpen, setModalOpen] = useState(false); // modal open/close
const { token, adminId } = useAdminAuth(); // get token from context
const column = [
  { header: "Patient Name", accessor: "patientname" },
  { header: "Dentist Name", accessor: "dentistname" },
  { header: "Scheduled Date", accessor: "date" },
  { header: "Status", accessor: "status" } // new column
];
const [appointments, setAppointments] = useState([]);
// Assuming `appointments` is your raw data array
const tabledata = appointments.map((appointment) => ({
  // Map columns to the Table component
  patientname: appointment.idpatient
    ? appointment.patientFullname
    : appointment.patient_name || "Unknown",

  dentistname: appointment.dentistFullname,

  date: formatDateTime(appointment.date), // format date as in your table

  status: appointment.status,
  dateCreated: formatDateTime(appointment.created_at ),

  // Action buttons
  onEdit: () => handleEdit(appointment),
  onDelete: () => handleDelete(appointment.idappointment),

}));
const [appointmentData, setAppointmentData] = useState([]);
const [showCalendar, setShowCalendar] = useState(true); // toggle state

const fetchAppointmentsForCalendar = async () => {
  try {
    const token = localStorage.getItem("jwt_token");
    const response = await axios.get(`${BASE_URL}/api/website/appointmentsforcalendar`, {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    });

    const now = new Date();

    const events = response.data.appointments
      .filter(a => new Date(a.date) >= now)
      .map((a) => {
        const formattedTime = new Date(a.date).toLocaleTimeString([], {
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        });

        return {
          id: a.idappointment,
          title: `${formattedTime} ${a.patientfullname || a.patient_name || "No Patient"}`,
          start: a.date,
          end: a.date,
          extendedProps: {
            patient: a.patientfullname || a.patient_name,
            services: a.services?.map((s) => s.name).join(", "),
            notes: a.notes,
            status: a.status,
          },
        };
      });

    setAppointmentData(events);
  } catch (error) {
    console.error("Error fetching appointments:", error);
  } finally {
    setIsLoading(false);
  }
};

useEffect(() => {
  fetchAppointmentsForCalendar(); // 👈 renamed call
}, []);



const [dentists, setDentists] = useState([]);
  const [patients, setPatients] = useState([]);
  


 
  const [isEditing, setIsEditing] = useState(false);  // To toggle edit mode
          const [editFormData, setEditFormData] = useState({
            id: '',
            patient: '',
            dentist: '',
            date: '',
            time: '',
            service: [],        // list of names
            serviceIds: [],     // list of ids
            serviceInput: '',
            status: '',
            notes: '',
          });
            const [services, setServices] = useState([]);
      const [isLoading, setIsLoading] = useState(true);
  const [openSuggestion, setOpenSuggestion] = useState(null); // can be 'patient', 'dentist', or null
 const [confirmDeleteId, setConfirmDeleteId] = useState(null); // holds id to delete

 const today = new Date().toISOString().split('T')[0];
 const [date, setDate] = useState('');

const allowedStatusesForDate = new Date(date) <= new Date(today)
  ? []
  : ["pending", "approved", "cancelled"];


 // Get unique full names of patients
const existingPatient = [
  ...new Set([
    // Registered patients
    ...patients
      .filter(p => p.firstname && p.lastname)
      .map(p => `${p.firstname} ${p.lastname}`),

    // Walk-in patient names from appointments
    ...appointments
      .filter(app => !app.idpatient && app.patient_name)
      .map(app => app.patient_name)
  ])
];
  // Get unique full names of dentists
  const existingDentist = [
    ...new Set(
      dentists
        .filter(d => d.firstname && d.lastname)
        .map(d => `${d.firstname} ${d.lastname}`)
    ),
  ];


  const existingTimes = [
    "09:00 AM", "10:00 AM", "11:00 AM", "12:00 PM",
    "01:00 PM", "02:00 PM", "03:00 PM", "04:00 PM",
    "05:00 PM", "06:00 PM"
  ];

  
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest('.usertype-input-wrapper')) {
        setOpenSuggestion(null);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);
  
 const [messageType, setMessageType] = useState(''); // 'success' or 'error'
              const [confirmMessage, setConfirmMessage] = useState('');
              const [showModal, setShowModal] = useState(false);
      const [message, setMessage] = useState('');
            const [showModal2, setShowModal2] = useState(false);



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
  
const fetchPatients = async () => {
  try {
    const res = await fetch(`${BASE_URL}/api/website/patients`);
    const data = await res.json();

    if (res.ok) {
      // data.patients is an array of objects like:
      // { idusers: 11, firstname: "Sugar", lastname: "Redillas", fullname: "Sugar Redillas" }
      setPatients(data.patients);
    } else {
      console.error('Failed to fetch patients:', data.message);
    }
  } catch (error) {
    console.error('Error fetching patients:', error);
  }
};

  
  useEffect(() => {
    
    fetchDentists();
    fetchPatients();
    fetchServices();
    
  }, []);
  const existingService = [...new Set(services.map(service => service.name).filter(Boolean))];

  const getFullNames = (appointments, dentists, patients) => {
    return appointments.map(appointment => {
      const patient = patients.find(p => String(p.idusers) === String(appointment.idpatient));
      const dentist = dentists.find(d => String(d.idusers) === String(appointment.iddentist));

      return {
        ...appointment,
        patientFullname: patient ? `${patient.firstname} ${patient.lastname}` : 'Unknown',
        dentistFullname: dentist ? `${dentist.firstname} ${dentist.lastname}` : 'Unknown'
      };
    });
  };

  const handleDelete = (id) => {
    setConfirmDeleteId(id);
    setMessageType('error');
    setConfirmMessage("Are you sure you want to delete this appointment?");
    setShowModal(true);
  };
const confirmDeletion = async () => {
  if (!confirmDeleteId) {
    showTemporaryModal('No appointment selected for deletion.', 'error');
    setShowModal(false);
    return;
  }

  try {
    const response = await fetch(`${BASE_URL}/api/website/appointments/${confirmDeleteId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${localStorage.getItem('jwt_token')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        adminId: localStorage.getItem('adminId'), // <-- send adminId here
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      showTemporaryModal(error.message || 'Failed to delete appointment.', 'error');
      return;
    }

    // ✅ Refresh calendar data from server
    await fetchAppointmentsForCalendar();

    showTemporaryModal('Appointment deleted successfully.', 'success');
  } catch (error) {
    console.error("Error deleting appointment:", error);
    showTemporaryModal('An error occurred while deleting the appointment.', 'error');
  } finally {
    setConfirmDeleteId(null);
    setShowModal(false);
  }
};



const fetchAppointments = async (filters = {}) => {
  try {
    setIsLoading(true);
    const response = await axios.get(`${BASE_URL}/api/website/appointments`);

    const now = Date.now();
    console.log('Current Time:', new Date(now).toString());

    const upcomingAppointments = response.data.appointments.filter(app => {
      // Parse as UTC (ISO string with Z)
      const appointmentUtc = new Date(app.date);
      return appointmentUtc.getTime() > now;
    });

    console.log('Filtered upcoming appointments:', upcomingAppointments.length);
    setAppointments(upcomingAppointments);
    return upcomingAppointments;
  } catch (error) {
    console.error('Error fetching appointments:', error);
    setAppointments([]);
    return [];
  } finally {
    setIsLoading(false);
  }
};





  useEffect(() => {
    const loadInitialAppointments = async () => {
      const data = await fetchAppointments({});
      const enriched = getFullNames(data, dentists, patients);
      setAppointments(enriched);
    };

    if (dentists.length > 0 ) {
      loadInitialAppointments();
    }
  }, [dentists, patients]);



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

const handleEditFormChange = (e) => {
  const { name, value } = e.target;
  setEditFormData((prevData) => ({
    ...prevData,
    [name]: value,
  }));
};

const handleEditSubmit = async (e) => {
  e.preventDefault();

  const patientName = editFormData.patient.trim();
  const dentistName = editFormData.dentist.trim();

  if (!patientName) {
    showTemporaryModal('Patient is required.', 'error');
    return;
  }

  if (!dentistName) {
    showTemporaryModal('Dentist is required.', 'error');
    return;
  }

  let patientObj = patients.find((p) => `${p.firstname} ${p.lastname}` === patientName);

  if (!patientObj && !patientName) {
    showTemporaryModal('Patient name is required.', 'error');
    return;
  }

  const dentistObj = dentists.find((d) => `${d.firstname} ${d.lastname}` === dentistName);

  if (!dentistObj) {
    showTemporaryModal('Dentist not found in records.', 'error');
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

  if (!existingTimes.includes(editFormData.time)) {
    showTemporaryModal('Time does not exist.', 'error');
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

  const selectedServiceIds = editFormData.service
    .map((serviceName) => {
      const serviceObj = services.find((s) => s.name === serviceName);
      return serviceObj ? serviceObj.idservice : null;
    })
    .filter((id) => id !== null);

  // Parse date and time with AM/PM and convert to UTC ISO string
  const [timePart, modifier] = editFormData.time.split(' ');
  let [hours, minutes] = timePart.split(':').map(Number);

  if (modifier === 'PM' && hours < 12) hours += 12;
  if (modifier === 'AM' && hours === 12) hours = 0;

  const [year, month, day] = editFormData.date.split('-').map(Number);
  const localDate = new Date(year, month - 1, day, hours, minutes, 0);

  const combinedDateTimeUTC = localDate.toISOString();

  // Validate not in past
  const selectedDateTime = new Date(combinedDateTimeUTC);
  const now = new Date();

  if (selectedDateTime.getTime() <= now.getTime()) {
    showTemporaryModal('Selected date and time cannot be in the past.', 'error');
    return;
  }

  const updatedAppointment = {
    iddentist: dentistObj.idusers,
    date: combinedDateTimeUTC,
    status: editFormData.status || 'pending',
    idservice: selectedServiceIds,
    notes: editFormData.notes || '',
    ...(patientObj
      ? { idpatient: patientObj.idusers }
      : { patient_name: patientName }),
      adminId,
  };

  try {
    const response = await axios.put(`${BASE_URL}/api/website/appointments/${editFormData.id}`, updatedAppointment, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('jwt_token')}`,
      },
    });

    if (response.status === 200) {
      setAppointments((prev) =>
        prev.map((appt) =>
          appt.idappointment === editFormData.id ? response.data.appointment : appt
        )
      );
      showTemporaryModal('Appointment updated successfully.', 'success');
      setIsEditing(false);
      setEditFormData({
        id: '',
        patient: '',
        dentist: '',
        date: '',
        time: '',
        service: [],
        serviceInput: '',
        status: '',
        notes: '',
      });
    }
  } catch (error) {
    const status = error.response?.status;
    const serverMessage = error.response?.data?.message;

    if (status === 400) {
      showTemporaryModal(serverMessage || 'Missing or invalid input fields.', 'error');
    } else if (status === 500) {
      showTemporaryModal(serverMessage || 'Internal server error occurred.', 'error');
    } else {
      showTemporaryModal(serverMessage || 'Unexpected error occurred.', 'error');
    }
  } finally {
    fetchDentists();
    fetchPatients();
    fetchServices();
  }
};


const handleEdit = async (appointment) => {
  try {
    const response = await axios.get(`${BASE_URL}/appointment-services/${appointment.idappointment}`);
    const servicesData = response.data.services || [];

    const serviceNames = servicesData.map(service => service.name);
    const serviceIds = servicesData.map(service => service.idservice);

    // Using dayjs for formatting date/time (you can swap with date-fns or manual)
    // If you don't want to add a library, you can keep your current approach
    const dateObj = new Date(appointment.date);
    const dateOnly = dateObj.toISOString().split('T')[0]; // 'YYYY-MM-DD'

    // Format time as hh:mm AM/PM
    let hours = dateObj.getHours();
    const minutes = dateObj.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;
    const timeFormatted = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')} ${ampm}`;

    setEditFormData({
      id: appointment.idappointment,
      patient: appointment.idpatient
        ? appointment.patientFullname
        : appointment.patient_name || '',
      dentist: appointment.dentistFullname,
      date: dateOnly,
      time: timeFormatted,
      service: serviceNames,
      serviceIds: serviceIds,
      serviceInput: '',
      status: appointment.status || 'pending',
      notes: appointment.notes || '',
    });

    setIsEditing(true);
  } catch (error) {
    console.error('Error fetching services for editing:', error);
    showTemporaryModal('Failed to fetch appointment services.', 'error');
  }
};

// Build dynamic appointment fields using existing patients, dentists, and services
const fieldsWithAppointments = {
  ...fieldTemplates,
  Appointments: (fieldTemplates.Appointments || []).map(field => {

if (field.name === "patient") {
  const patientOptions = (patients || []).map(p => ({
    label: p.fullname,                          // always present
    value: p.idusers ? p.idusers : p.fullname   // use idusers if available, else fallback to fullname
  }));

  // Deduplicate by label (case-insensitive)
  const uniquePatientOptions = Array.from(
    new Map(patientOptions.map(opt => [opt.label.toLowerCase(), opt])).values()
  );

  return { ...field, options: uniquePatientOptions };
}


    // 2️⃣ Dentist dropdown
    if (field.name === "dentist") {
      const dentistOptions = (dentists || []).filter(d => d.firstname && d.lastname)
        .map(d => ({ label: `${d.firstname} ${d.lastname}`, value: d.idusers }));

      const uniqueDentistOptions = Array.from(
        new Map(dentistOptions.map(opt => [opt.label.toLowerCase(), opt])).values()
      );

      return { ...field, options: uniqueDentistOptions };
    }

    // 3️⃣ Services multi-select
    if (field.name === "services") {
      const serviceOptions = (services || []).filter(s => s.name && s.idservice)
        .map(s => ({ label: s.name, value: s.idservice }));

      const uniqueServiceOptions = Array.from(
        new Map(serviceOptions.map(opt => [opt.label.toLowerCase(), opt])).values()
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
    return;
  }

  try {
    console.log("📝 Original Form Values:", formValues);

    // ⭐ Convert date + time to UTC ISO and check if it's in the past
    let appointmentDate = null;
    if (formValues.date && formValues.time) {
      const [hours, minutes] = formValues.time.split(":").map(Number);
      const manilaStr = `${formValues.date}T${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:00+08:00`;
      appointmentDate = new Date(manilaStr);

      if (isNaN(appointmentDate)) {
        setMessage({ type: "error", text: "Invalid date or time." });
        return;
      }

      const now = new Date();
      if (appointmentDate <= now) {
        setMessage({ type: "error", text: "Cannot add an appointment in the past." });
        return;
      }
    }

    // Build payload
    const payload = { adminId, status: "pending" };
    if (appointmentDate) payload.date = appointmentDate.toISOString();

    // Handle patient
    if (formValues.patient !== undefined && formValues.patient !== null) {
      if (!isNaN(formValues.patient)) payload.idpatient = Number(formValues.patient);
      else payload.patient_name = formValues.patient;
    }

    // Handle dentist
    if (formValues.dentist !== undefined && formValues.dentist !== null) {
      payload.iddentist = Number(formValues.dentist);
    }

    // Handle services (array of numeric IDs)
    if (Array.isArray(formValues.services)) {
      const serviceIds = formValues.services.map(s => Number(s)).filter(id => !isNaN(id));
      if (serviceIds.length > 0) payload.idservice = serviceIds;
    }

    // Append other fields
    Object.entries(formValues).forEach(([key, value]) => {
      if (
        value !== null &&
        value !== "" &&
        value !== undefined &&
        !["patient", "dentist", "date", "time", "services", "Appointments"].includes(key)
      ) {
        payload[key] = value;
      }
    });

    console.log("🧹 Payload ready:", payload);

    // Send request as JSON
    const response = await axios.post(`${BASE_URL}/api/website/appointments`, payload, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (response.status === 201) {
      await fetchServices();
      await fetchDentists();
      await fetchPatients();
      await fetchAppointments();
      await fetchAppointmentsForCalendar();
      setMessage({ type: "success", text: `✅ ${formValues.appointments || "Appointment"} added successfully!` });
      setModalOpen(false);
      setTimeout(() => setMessage(null), 2000);
    } else {
      setMessage({ type: "error", text: response.data?.message || "Something went wrong." });
    }
  } catch (error) {
    console.error("handleAdd error:", error);

    let errorMessage = "Could not connect to server. Please try again later.";
    if (error.response) {
      const { status, data } = error.response;
      if (status === 400) errorMessage = "Missing or invalid input fields.";
      else if (status === 500) errorMessage = "Internal server error occurred.";
      else errorMessage = data?.message || errorMessage;
    }

    setMessage({ type: "error", text: errorMessage });
  }
};



          

  return (
    <div className="container py-4">
      {/* Title and add side by side */}
      <div className="d-flex align-items-center justify-content-between mb-3 flex-wrap gap-3">
        {/* Left side: Title + Add Button + Toggle */}
        <div className="d-flex align-items-center gap-3">
          <div className="same-row">
            <h1>Appointment Management</h1>
            <button className="btn-add" onClick={() => setModalOpen(true)}>+</button>

            {/* 👇 Toggle button between Add and Report */}
            <button
              className="btn-toggle"
              onClick={() => setShowCalendar(!showCalendar)}
            >
              {showCalendar ? "Show Table" : "Show Calendar"}
            </button>

            <div className="report-section">
              {/* Right side: Export buttons */}
              <AppointmentReportExport appointments={appointments} />
            </div>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="loading-text">Loading...</div>
      ) : (
<>
 {showCalendar ? (
        <AppointmentCalendar
          appointments={appointmentData}
          table="Appointment"
          onDelete={(id) => handleDelete(id)}
        />
      ) : (
        <Table
          columns={column}
          data={tabledata}
          showInfoFields={showInfoFields}
          fieldColumn="Appointments"
        />
      )}
        </>
      )}
 {isEditing && (
  <div className="modal-overlay">
    <div className="modal-box">
      <h2>Edit Appointment</h2>
      <form onSubmit={handleEditSubmit}>
        <div className="form-row">
          <div className="form-group usertype-input-wrapper">
            <input
              type="text"
              name="patient"
              placeholder="Select Patient"
              value={editFormData.patient}
              onChange={(e) => {
                const value = e.target.value;
                setEditFormData(prev => ({ ...prev, patient: value }));
                setOpenSuggestion('patient');
              }}
              onFocus={() => setOpenSuggestion('patient')}
              className="form-control"
              autoComplete="off"
            />
            {openSuggestion === 'patient' && (
              <ul className="suggestions-list">
                {existingPatient
                  .filter(cat =>
                    cat.toLowerCase().includes(editFormData.patient.toLowerCase())
                  )
                  .map((cat, index) => (
                    <li
                      key={index}
                      className="suggestion-item"
                      onClick={() => {
                        setEditFormData(prev => ({ ...prev, patient: cat }));
                        setOpenSuggestion(null);
                      }}
                    >
                      {cat}
                    </li>
                  ))}
              </ul>
            )}
          </div>

          <div className="form-group usertype-input-wrapper">
            <input
              type="text"
              name="dentist"
              placeholder="Select Dentist"
              value={editFormData.dentist}
              onChange={(e) => {
                const value = e.target.value;
                setEditFormData(prev => ({ ...prev, dentist: value }));
                setOpenSuggestion('dentist');
              }}
              onFocus={() => setOpenSuggestion('dentist')}
              className="form-control"
              autoComplete="off"
            />
            {openSuggestion === 'dentist' && (
              <ul className="suggestions-list">
                {existingDentist
                  .filter(cat =>
                    cat.toLowerCase().includes(editFormData.dentist.toLowerCase())
                  )
                  .map((cat, index) => (
                    <li
                      key={index}
                      className="suggestion-item"
                      onClick={() => {
                        setEditFormData(prev => ({ ...prev, dentist: cat }));
                        setOpenSuggestion(null);
                      }}
                    >
                      {cat}
                    </li>
                  ))}
              </ul>
            )}
          </div>
          <div className="form-group">
       <input
  type="date"
  name="date"
  value={editFormData.date}
  onChange={(e) => {
    const value = e.target.value;
    setEditFormData(prev => ({ ...prev, date: value }));
    setDate(value); // update internal date state
    const today = new Date().toISOString().split('T')[0];
    const allowed = value < today
      ? []
      : ["pending", "approved",  "cancelled"];
    // If current status is not allowed for new date, clear it
    if (!allowed.includes(editFormData.status)) {
      setEditFormData(prev => ({ ...prev, status: "" }));
    }
  }}
  className="form-control"
  min={new Date().toISOString().split("T")[0]} // min date is today
/>


</div>
        </div>

        <div className="form-row">
          <div className="form-group usertype-input-wrapper">
            <input
              type="text"
              name="time"
              placeholder="Select Time"
              value={editFormData.time}
              onChange={(e) => {
                const value = e.target.value;
                setEditFormData(prev => ({ ...prev, time: value }));
                setOpenSuggestion("time");
              }}
              onFocus={() => setOpenSuggestion("time")}
              className="form-control"
              autoComplete="off"
            />
            {openSuggestion === "time" && (
              <ul className="suggestions-list">
                {existingTimes
                  .filter(t =>
                    t.toLowerCase().includes(editFormData.time.toLowerCase())
                  )
                  .map((t, index) => (
                    <li
                      key={index}
                      className="suggestion-item"
                      onClick={() => {
                        setEditFormData(prev => ({ ...prev, time: t }));
                        setOpenSuggestion(null);
                      }}
                    >
                      {t}
                    </li>
                  ))}
              </ul>
            )}
          </div>
          <div className="form-group usertype-input-wrapper">
              <input
                type="text"
                name="status"
                placeholder="Select Status"
                value={editFormData.status}
                onChange={(e) => {
                  const value = e.target.value;
                  setEditFormData(prev => ({ ...prev, status: value }));
                  setOpenSuggestion("status");
                }}
                onFocus={() => setOpenSuggestion("status")}
                className="form-control"
                autoComplete="off"
              />
              {openSuggestion === "status" && (
                <ul className="suggestions-list">
                  {allowedStatusesForDate
                    .filter(t =>
                      t.toLowerCase().includes(editFormData.status.toLowerCase())
                    )
                    .map((t, index) => (
                      <li
                        key={index}
                        className="suggestion-item"
                        onClick={() => {
                          setEditFormData(prev => ({ ...prev, status: t }));
                          setOpenSuggestion(null);
                        }}
                      >
                        {t}
                      </li>
                    ))}
                </ul>
              )}
            </div>
          <div className="form-group usertype-input-wrapper">
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
              <ul className="suggestions-list">
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
          </div>
        </div>

        <div className='form-row'>
        <div className="form-group">
            <input
              type="text"
              name="notes"
              value={editFormData.notes}
              placeholder='Input Notes (Optional)'
              onChange={handleEditFormChange}
              className="form-control"
            />
          </div>
          
  {/* Show selected services as tags */}
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
)}

{modalOpen && (
  <AddModal
    datatype="Appointments"             // for submission data
    choices={["Appointments"]}       // minimal default choice
    selected="Appointments"           // default active type
    fields={fieldsWithAppointments}      // object: { Default: [...] }
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

export default Appointment;
