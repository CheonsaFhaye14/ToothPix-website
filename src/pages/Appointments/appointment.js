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
import EditModal from '../../Components/AddModal/EditModal.jsx';
import { fieldTemplatesEdit } from '../../data/FieldTemplates/appointmentsfieldTemplatesEdit.js';
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
const tabledata = appointments.map((appointment) => {
  // Always derive from raw backend values for edit
  const rawDate = new Date(appointment.date);

  // Manila-local date and time
  const manilaDate = rawDate.toLocaleDateString("en-CA", { timeZone: "Asia/Manila" }); // "YYYY-MM-DD"
  const manilaHours = new Intl.DateTimeFormat("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "Asia/Manila"
  }).format(rawDate); // e.g. "18:00"

  const row = {
    // Columns shown in the table (can be formatted)
    patientname: appointment.idpatient
      ? appointment.patientFullname
      : appointment.patient_name || "Unknown",
    dentistname: appointment.dentistFullname,
    date: formatDateTime(appointment.date), // OK for display only
    status: appointment.status,
    dateCreated: formatDateTime(appointment.created_at),

    // ✅ Services shown as "name, name"
    services: appointment.services
      ? appointment.services.map(s => s.name).join(", ")
      : "",

    // Actions
    onEdit: () => {
      const normalizedRow = {
        idappointment: appointment.idappointment,
        patient: appointment.idpatient || appointment.patient_name,
        dentist: appointment.iddentist,
        date: manilaDate,               // "YYYY-MM-DD"
        time: manilaHours.slice(0, 5),  // "HH:mm"
        services: appointment.services
          ? appointment.services.map(s => s.idservice) // IDs for edit
          : [],
        status: appointment.status,
        notes: appointment.notes || "",
      };

      setEditingAppointment(normalizedRow);
    },

    onDelete: () => {
      handleDelete(appointment.idappointment);
    },
  };

  return row;
});


const [editingAppointment, setEditingAppointment] = useState(null);
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
        const dateObj = new Date(a.date);
        const formattedTime = dateObj.toLocaleTimeString([], {
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
            // ✅ include everything you might need later
            idappointment: a.idappointment,
            idpatient: a.idpatient,
            patient: a.patientfullname || a.patient_name,
            iddentist: a.iddentist,
            dentist: a.dentistfullname,
            date: a.date,
            created_at: a.created_at,
            status: a.status,
            notes: a.notes,
            // services both as names and IDs
            services: a.services?.map(s => s.name).join(", ") || "",
            serviceIds: a.services?.map(s => s.idservice) || [],
          },
        };
      });

    console.log("Events sent to calendar:", events);
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
  


            const [services, setServices] = useState([]);
      const [isLoading, setIsLoading] = useState(true);
 const [confirmDeleteId, setConfirmDeleteId] = useState(null); // holds id to delete


  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest('.usertype-input-wrapper')) {
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

    const upcomingAppointments = response.data.appointments.filter(app => {
      // Parse as UTC (ISO string with Z)
      const appointmentUtc = new Date(app.date);
      return appointmentUtc.getTime() > now;
    });

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

const handleAdd = async (formValues) => {
  if (!token || !adminId) {
    setMessage({ type: "error", text: "You must be logged in as admin." });
    return;
  }

  try {

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

const handleEdit = async (appointmentId, formValues) => {
  if (!token || !adminId) {
    setMessage({ type: "error", text: "You must be logged in as admin." });
    return;
  }

  try {

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
        setMessage({ type: "error", text: "Cannot set an appointment in the past." });
        return;
      }
    }

    // Build payload
    const payload = { admin_id: adminId }; // ✅ backend expects admin_id
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


    // Send request as JSON
    const response = await axios.put(`${BASE_URL}/api/website/appointments/${appointmentId}`, payload, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (response.status === 200) {
    await fetchServices();
      await fetchDentists();
      await fetchPatients();
      await fetchAppointments();
      await fetchAppointmentsForCalendar();
 setMessage({ type: "success", text: "✏️ Appointment updated successfully!" });
      setEditingAppointment(null);
      setTimeout(() => setMessage(null), 2000);
    } else {
      setMessage({ type: "error", text: response.data?.message || "Something went wrong." });
    }
  } catch (error) {
    console.error("handleEdit error:", error);

    let errorMessage = "Could not connect to server. Please try again later.";
    if (error.response) {
      const { status, data } = error.response;
      if (status === 400) errorMessage = "Missing or invalid input fields.";
      else if (status === 404) errorMessage = "Appointment not found.";
      else if (status === 500) errorMessage = "Internal server error occurred.";
      else errorMessage = data?.message || errorMessage;
    }

    setMessage({ type: "error", text: errorMessage });
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


// Build a separate edit-only version by appending status
const fieldsWithAppointmentsEdit  = {
  ...fieldTemplatesEdit,
  Appointments: (fieldTemplatesEdit.Appointments || []).map(field => {

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
// Right before rendering AppointmentCalendar

<AppointmentCalendar
  appointments={appointmentData}
  table="Appointment"
  onEdit={(event) => {
    // event here is the FullCalendar event object you clicked
    const rawDate = new Date(event.start);

    // Manila-local date and time
    const manilaDate = rawDate.toLocaleDateString("en-CA", { timeZone: "Asia/Manila" }); // "YYYY-MM-DD"
    const manilaHours = new Intl.DateTimeFormat("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
      timeZone: "Asia/Manila"
    }).format(rawDate); // e.g. "18:00"

    const normalizedRow = {
      idappointment: event.id,
      patient: event.extendedProps.idpatient || event.extendedProps.patient,
      dentist: event.extendedProps.iddentist,
      date: manilaDate,
      time: manilaHours.slice(0, 5),
      services: event.extendedProps.serviceIds || [],
      status: event.extendedProps.status,
      notes: event.extendedProps.notes || "",
    };

    console.log("Normalized row for edit:", normalizedRow);
    setEditingAppointment(normalizedRow);
  }}
  onDelete={(id) => {
    handleDelete(id);
  }}
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
{editingAppointment && (
  <EditModal
    datatype="Appointments"
    selected="Appointments"
    choices={["Appointments"]}
    fields={fieldsWithAppointmentsEdit}
    row={editingAppointment}
    onClose={() => setEditingAppointment(null)}
    onSubmit={(formValues) => handleEdit(editingAppointment.idappointment, formValues)}
  />
)}

{showModal && (
    <div className="modal-overlay">
        <div className={`modal-box ${messageType}`}>
        <p>{confirmDeleteId ? confirmMessage : message}</p>
        {confirmDeleteId ? (
            <div className="action-buttons"style={{ marginTop: '1rem' }}>
            <button className="btn-submit" onClick={confirmDeletion}>Yes</button>
            <button className="btn-cancel" onClick={() => {
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
