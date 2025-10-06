import React, { useState, useEffect } from 'react'; 
import '../../design/appointment.css';
import axios from 'axios';
import AppointmentReportExport from './AppointmentReportExport';



const Appointment = () => {
  const [appointments, setAppointments] = useState([]);
  const [filters, setFilters] = useState({ dentist: '', patient: '', startDate: '', endDate: '', status: '' });
  const [dentists, setDentists] = useState([]);
  const [patients, setPatients] = useState([]);
  const adminId = localStorage.getItem("adminId");
  
         const filteredAppointments = appointments.filter(appointment => {
  // Filter by date range (if any)
  if (filters.startDate && filters.endDate) {
    const appointmentDateOnly = appointment.date.split('T')[0];
    if (appointmentDateOnly < filters.startDate || appointmentDateOnly > filters.endDate) return false;
  }

  // Filter by status (if any)
  if (filters.status && appointment.status.toLowerCase() !== filters.status.toLowerCase()) {
    return false;
  }

  // Filter by patient
  if (filters.patient) {
    // Check if this appointment's patient matches filter:
    // 1) If registered patient, compare with fullname
    // 2) If walk-in, compare with patient_name
    const fullname = appointment.patientFullname?.trim().toLowerCase();
    const walkinName = appointment.patient_name?.trim().toLowerCase();
    const filterName = filters.patient.trim().toLowerCase();

    if (appointment.idpatient) {
      if (fullname !== filterName) return false;
    } else {
      if (walkinName !== filterName) return false;
    }
  }

  return true;
});

 
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
      const baseUrl2 = 'https://toothpix-backend.onrender.com/api/app/services';
      const API_BASE= 'https://toothpix-backend.onrender.com';
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

  const existingTimes = [
    "09:00 AM", "10:00 AM", "11:00 AM", "12:00 PM",
    "01:00 PM", "02:00 PM", "03:00 PM", "04:00 PM",
    "05:00 PM", "06:00 PM"
  ];

  
  // Get unique full names of dentists
  const existingDentist = [
    ...new Set(
      dentists
        .filter(d => d.firstname && d.lastname)
        .map(d => `${d.firstname} ${d.lastname}`)
    ),
  ];

  
  // Convert existingTimes to 24-hour format once for easier comparison
  
const sortedAppointments = React.useMemo(() => {
  const sorted = [...filteredAppointments];

  sorted.sort((a, b) => {
    const dateA = new Date(a.date);
    const dateB = new Date(b.date);

    if (dateA < dateB) return -1;
    if (dateA > dateB) return 1;

    // If same datetime, sort by ID
    return a.idappointment - b.idappointment;
  });

  return sorted;
}, [filteredAppointments]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest('.usertype-input-wrapper')) {
        setOpenSuggestion(null);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);
  
                 
 const [addFormData, setAddFormData] = React.useState({
               patient: '',
               dentist:'',
               date: '',
               time: '',
               service: []  // an array of selected services
                });
 const [messageType, setMessageType] = useState(''); // 'success' or 'error'
              const [confirmMessage, setConfirmMessage] = useState('');
              const [showModal, setShowModal] = useState(false);
      const [message, setMessage] = useState('');
            const [showModal2, setShowModal2] = useState(false);
    const [isAdding, setIsAdding] = React.useState(false);



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
          const response = await axios.get(baseUrl2, {
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
          const res = await fetch('https://toothpix-backend.onrender.com/api/app/patients');
          const data = await res.json();
          if (res.ok) setPatients(data.patients);
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

const formatAppointmentDate = (utcDateString) => {
  if (!utcDateString) return '';

  const date = new Date(utcDateString); // parses ISO string as UTC automatically

  return new Intl.DateTimeFormat('en-PH', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
    timeZone: 'Asia/Manila',  // convert and format in Manila timezone
  }).format(date);
};


  
  const handleDelete = (id) => {
    setConfirmDeleteId(id);
    setMessageType('error');
    setConfirmMessage("Are you sure you want to delete this user?");
    setShowModal(true);
  };
   

const fetchAppointments = async (filters = {}) => {
  try {
    setIsLoading(true);
    const response = await axios.get('https://toothpix-backend.onrender.com/api/app/appointments');

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

 const handleFilterChange = async (e) => {
  const { name, value } = e.target;
  const newFilters = { ...filters, [name]: value };
  setFilters(newFilters);

  // If you want to fetch from backend:
  if (['dentist', 'patient', 'status'].includes(name)) {
    const data = await fetchAppointments(newFilters);
    const enriched = getFullNames(data, dentists, patients);
    setAppointments(enriched);
  }
};


  const clearFilters = async () => {
    const emptyFilters = { dentist: '', patient: '', startDate: '', endDate: '', status: '' };
    setFilters(emptyFilters);
    const data = await fetchAppointments(emptyFilters);
    const enriched = getFullNames(data, dentists, patients);
    setAppointments(enriched);
  };

 
  const baseUrl = 'https://toothpix-backend.onrender.com/api/app/appointments';

  const confirmDeletion = async () => {
    if (!confirmDeleteId) {
      showTemporaryModal('No appointment selected for deletion.', 'error');
      setShowModal(false);
      return;
    }
  
    try {
      const response = await fetch(`${baseUrl}/${confirmDeleteId}`, {
        method: 'DELETE',
      });
  
      if (!response.ok) {
        const error = await response.json();
        showTemporaryModal(error.message || 'Failed to delete appointment.', 'error');
        return;
      }
  
      setAppointments(prevAppointments =>
        prevAppointments.filter(appointment => appointment.idappointment !== confirmDeleteId)
      );
      showTemporaryModal('Appointment deleted successfully.', 'success');
    } catch (error) {
      console.error("Error deleting appointment:", error);
      showTemporaryModal('An error occurred while deleting the appointment.', 'error');
    } finally {
      setConfirmDeleteId(null);
      setShowModal(false);
    }
  };
  
  
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

  const patientObj = patients.find(p => `${p.firstname} ${p.lastname}` === patientName);
  const dentistObj = dentists.find(d => `${d.firstname} ${d.lastname}` === dentistName);

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

  if (!existingTimes.includes(addFormData.time)) {
    showTemporaryModal('Time does not exist.', 'error');
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

  const selectedServiceIds = addFormData.service
    .map(serviceName => {
      const serviceObj = services.find(s => s.name === serviceName);
      return serviceObj ? serviceObj.idservice : null;
    })
    .filter(id => id !== null);

  // Convert 12h time to 24h
  const [timePart, modifier] = addFormData.time.split(' ');
  let [hours, minutes] = timePart.split(':').map(Number);

  if (modifier === 'PM' && hours < 12) hours += 12;
  if (modifier === 'AM' && hours === 12) hours = 0;

  // Create a Date object in Manila timezone by constructing the ISO string with timezone offset +08:00
  // This avoids JS timezone confusion
  const manilaDateTimeStr = `${addFormData.date}T${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:00+08:00`;
  const appointmentDate = new Date(manilaDateTimeStr);

  if (isNaN(appointmentDate)) {
    showTemporaryModal('Invalid date or time.', 'error');
    return;
  }

  const now = new Date();
  if (appointmentDate.getTime() <= now.getTime()) {
    showTemporaryModal('Selected date and time cannot be in the past.', 'error');
    return;
  }

  // Convert Manila time Date to UTC ISO string
  const utcISOString = appointmentDate.toISOString();

  const newAppointment = {
    iddentist: dentistObj.idusers,
    date: utcISOString,
    status: 'pending',
    idservice: selectedServiceIds,
    notes: '',
    ...(patientObj
      ? { idpatient: patientObj.idusers }
      : { patient_name: patientName }),
      adminId,
  };

  console.log(newAppointment);

  try {
    const response = await axios.post(
      'https://toothpix-backend.onrender.com/api/website/appointments',
      newAppointment,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('jwt_token')}`,
        },
      }
    );

    if (response.status === 201) {
      setAppointments((prev) => [...prev, response.data.appointment]);
      showTemporaryModal('Appointment added successfully.', 'success');
      setIsAdding(false);
      setAddFormData({
        patient: '',
        dentist: '',
        date: '',
        time: '',
        service: [],
        serviceInput: '',
      });
    }
  } catch (error) {
    if (error.response) {
      const status = error.response.status;
      const serverMessage = error.response.data.message;

      if (status === 400) {
        showTemporaryModal(serverMessage || 'Missing or invalid input fields.', 'error');
      } else if (status === 500) {
        showTemporaryModal(serverMessage || 'Internal server error occurred.', 'error');
      } else {
        showTemporaryModal(serverMessage || 'Unexpected error occurred.', 'error');
      }
    } else {
      showTemporaryModal('Could not connect to server. Please try again later.', 'error');
    }
  } finally {
    fetchDentists();
    fetchPatients();
    fetchServices();
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
  };

  try {
    const response = await axios.put(`${baseUrl}/${editFormData.id}`, updatedAppointment, {
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
    const response = await axios.get(`${API_BASE}/appointment-services/${appointment.idappointment}`);
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


  
          
          

  return (
    <div className="container py-4">

    {/* Title and add side by side */}
<div className="d-flex align-items-center justify-content-between mb-3 flex-wrap gap-3">
  {/* Left side: Title + Add Button */}
  <div className="d-flex align-items-center gap-3">
    <h2 className="m-0">Appointment Management</h2>
    <button
      className="add-user-btn"
      onClick={() => setIsAdding(true)}
      title="Add Appointment"
    />
  </div>

  {/* Right side: Export buttons (PASS enriched data) */}
  <AppointmentReportExport appointments={appointments} />
</div>




    


      {isLoading ? (
        <div className="loading-text">Loading...</div>
      ) : (
<>
{/*Filter Controls */}
        <div className="filter-controls">
         
        <select
  name="patient"
  value={filters.patient}
  onChange={handleFilterChange}
  className="form-select sort-select"
>
  <option value="">Patient</option>
  
  {/* Registered patients */}
  {patients.map(p => (
    <option key={`patient-${p.idusers}`} value={`${p.firstname} ${p.lastname}`}>
      {p.firstname} {p.lastname}
    </option>
  ))}

  {/* Walk-in patients from appointments */}
  {appointments
    .filter(app => !app.idpatient && app.patient_name)
    .map((app, index) => (
      <option key={`walkin-${index}`} value={app.patient_name}>
        {app.patient_name}
      </option>
    ))}
</select>


          <select
            name="dentist"
            value={filters.dentist}
            onChange={handleFilterChange}
            className="form-select sort-select"
          >
            <option value="">Dentist</option>
            {dentists.map(d => (
              <option key={d.idusers} value={d.idusers}>
                {d.firstname} {d.lastname}
              </option>
            ))}
          </select>
  
          <select
            name="status"
            value={filters.status}
            onChange={handleFilterChange}
            className="form-select sort-select"
          >
            <option value="">Status</option>
            <option value="Pending">Pending</option>
            <option value="Approved">Approved</option>
            <option value="Cancelled">Cancelled</option>
            <option value="Rescheduled">Rescheduled</option>
          </select>
  
          <div className="d-flex flex-column">
            <label className="small ms-4">Start Date</label>
            <input
              type="date"
              name="startDate"
              className="form-control"
              value={filters.startDate}
              onChange={handleFilterChange}
            />
          </div>
  
          <div className="d-flex flex-column">
            <label className="small ms-4">End Date</label>
            <input
              type="date"
              name="endDate"
              className="form-control form-control"
              value={filters.endDate}
              onChange={handleFilterChange}
            />
          </div>
  
  
         
          <button className="btn btn-secondary show-all-btn" onClick={clearFilters}>
            Show All
          </button>
      </div>

      
          <table className="table table-bordered users-table">
  <thead>
    <tr>
      {/* Removed Appointment ID */}
      <th>Patient Name</th>
      <th>Dentist Name</th>
      <th>Scheduled Date</th>
      <th>Status</th>
      <th className="actions-column"> </th>
    </tr>
  </thead>
  <tbody>
    {sortedAppointments.length === 0 ? (
      <tr>
        <td colSpan="5" className="text-center">No appointments found</td>
      </tr>
    ) : (
      sortedAppointments.map((appointment) => (
        <tr key={appointment.idappointment}>
          {/* Use patient_name for walk-ins, patientFullname for registered */}
          <td>
            {appointment.idpatient
              ? appointment.patientFullname
              : appointment.patient_name || 'Unknown'}
          </td>
          <td>{appointment.dentistFullname}</td>
          <td>{formatAppointmentDate(appointment.date)}</td>
          <td>
            <span className={`status ${appointment.status.toLowerCase()}`}>
              {appointment.status}
            </span>
          </td>
          <td className="actions-column">
            <button className="btn-edit me-2" onClick={() => handleEdit(appointment)}>✏️ Edit</button>
            <button className="btn-delete" onClick={() => handleDelete(appointment.idappointment)}>🗑️ Delete</button>
          </td>
        </tr>
      ))
    )}
  </tbody>
</table>

    
        </>
      )}




    {isAdding && (
    <div className="modal-overlay">
        <div className="modal-box">
        <h2>Add New Appointment</h2>
        <form onSubmit={handleAddSubmit}>
            <div className="form-row">
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
        .filter(cat =>
            cat.toLowerCase().includes(addFormData.patient.toLowerCase())
        )
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
        .filter(cat =>
            cat.toLowerCase().includes(addFormData.dentist.toLowerCase())
        )
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
            <div className="form-group">
   
    <div className="form-group">
  <input
    type="date"
    name="date"
    value={addFormData.date}
    onChange={handleAddFormChange}
    className="form-control"
    min={new Date().toISOString().split("T")[0]} // min today
  />
</div>

    </div>

            </div>
            <div className="form-row">
            <div className="form-group usertype-input-wrapper">
    
    <input
        type="text"
        name="time"
        value={addFormData.time}
        onChange={(e) => {
        const value = e.target.value;
        setAddFormData(prev => ({ ...prev, time: value }));
        setOpenSuggestion("time");
        }}
        onFocus={() => setOpenSuggestion("time")}
        className="form-control"
        autoComplete="off"
         placeholder="Select Time"
    />

    {openSuggestion === "time" && (
        <ul className="suggestions-list">
        {existingTimes
            .filter(t =>
            t.toLowerCase().includes(addFormData.time.toLowerCase())
            )
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

    <div className="form-group usertype-input-wrapper">
    

    <div className="input-and-tags-wrapper">
        <input
        type="text"
        name="service"
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
         placeholder="Select Service"
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
                    showTemporaryModal('You can only select up to 3 services.', 'error' );
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
                  {/* Show selected services as tags */}
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
         </div>
            <div className="form-actions">
            <button type="submit" className="btn btn-primary">
                Add User
            </button>
            <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="btn btn-secondary"
            >
                Cancel
            </button>
            </div>
        </form>
        </div>
    </div>
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

export default Appointment;
