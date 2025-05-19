import React, { useState, useEffect } from 'react'; 
import '../design/appointment.css';
import axios from 'axios';

const Appointment = () => {
  const [appointments, setAppointments] = useState([]);
  const [filters, setFilters] = useState({ dentist: '', patient: '', startDate: '', endDate: '', status: '' });
  const [dentists, setDentists] = useState([]);
  const [patients, setPatients] = useState([]);
  const [sortBy, setSortBy] = React.useState('idappointment');
const [sortDirection, setSortDirection] = React.useState('asc');
const handleSortByChange = (e) => {
    setSortBy(e.target.value);
  };
  
           // Filter appointments by date only (optional if backend filters date)
           const filteredAppointments = appointments.filter(appointment => {
            if (filters.startDate && filters.endDate) {
              const appointmentDateOnly = appointment.date.split('T')[0];
              if (appointmentDateOnly < filters.startDate || appointmentDateOnly > filters.endDate) return false;
            }
            if (filters.status && appointment.status.toLowerCase() !== filters.status.toLowerCase()) {
              return false;
            }
            return true;
          });
  const handleSortDirectionChange = (e) => {
    setSortDirection(e.target.value);
  };

 
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

 const allowedStatusesForDate = date <= today
   ? ["cancelled", "completed"]
   : ["pending", "approved", "cancelled", "rescheduled"];

 // Get unique full names of patients
const existingPatient = [
    ...new Set(
      patients
        .filter(p => p.firstname && p.lastname)
        .map(p => `${p.firstname} ${p.lastname}`)
    ),
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
// Helper: Convert 12-hour time (e.g. "09:00 AM") to 24-hour string "09:00"
const to24Hour = (time12h) => {
    const [time, meridiem] = time12h.split(' ');
    let [hour, minute] = time.split(':').map(Number);
  
    if (meridiem === "PM" && hour !== 12) hour += 12;
    if (meridiem === "AM" && hour === 12) hour = 0;
  
    return (hour < 10 ? '0' + hour : hour) + ':' + (minute < 10 ? '0' + minute : minute);
  }
  
  // Convert existingTimes to 24-hour format once for easier comparison
  const existingTimes24 = existingTimes.map(t => to24Hour(t));
  
  const sortedAppointments = React.useMemo(() => {
    const sorted = [...filteredAppointments];
  
    sorted.sort((a, b) => {
      let aVal, bVal;
  
      switch (sortBy) {
        case 'idappointment':
          aVal = a.idappointment;
          bVal = b.idappointment;
          break;
  
        case 'date':
          // Extract date part "2025-05-21" from ISO datetime string
          aVal = a.date.split('T')[0];
          bVal = b.date.split('T')[0];
          break;
  
        case 'time':
          // Extract time part "09:00:00" and convert to "HH:mm"
          const extractTime24 = (dateTimeStr) => {
            // dateTimeStr = "2025-05-21T09:00:00"
            const timePart = dateTimeStr.split('T')[1]; // "09:00:00"
            if (!timePart) return "99:99"; // fallback to push unknown to end
            const [hour, minute] = timePart.split(':');
            return hour + ':' + minute; // e.g. "09:00"
          };
  
          aVal = extractTime24(a.date);
          bVal = extractTime24(b.date);
  
          // Find index in existingTimes24 array (which is sorted 9AM to 6PM)
          aVal = existingTimes24.indexOf(aVal);
          bVal = existingTimes24.indexOf(bVal);
  
          if (aVal === -1) aVal = 999;
          if (bVal === -1) bVal = 999;
          break;
  
        default:
          aVal = a.idappointment;
          bVal = b.idappointment;
      }
  
      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  
    return sorted;
  }, [filteredAppointments, sortBy, sortDirection]);
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

  const formatAppointmentDate = (isoString) => {
    if (!isoString) return '';
    
    const date = new Date(isoString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
  
    let hours = date.getHours();
    const minutes = String(date.getMinutes()).padStart(2, '0');
  
    // Convert 24-hour to 12-hour format
    const ampm = hours >= 12 ? ' PM' : ' AM';
    hours = hours % 12;
    hours = hours === 0 ? 12 : hours; // the hour '0' should be '12'
    const strHours = String(hours).padStart(2, '0');
  
    return `${year}-${month}-${day} ${strHours}:${minutes}${ampm}`;
  };
  
  const handleDelete = (id) => {
    setConfirmDeleteId(id);
    setMessageType('error');
    setConfirmMessage("Are you sure you want to delete this user?");
    setShowModal(true);
  };
   

  const fetchAppointments = async ({ dentist, patient, startDate, endDate, status }) => {
    try {
      setIsLoading(true);
      const params = {};
      if (dentist) params.dentist = dentist;
      if (patient) params.patient = patient;
      if (startDate && endDate) {
        params.startDate = startDate;
        params.endDate = endDate;
      }
      if (status) params.status = status;
      const response = await axios.get('https://toothpix-backend.onrender.com/api/app/appointments/search', { params });
      return response.data.appointments;
    } catch (error) {
      console.error('Error fetching appointments:', error);
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

    if (dentists.length > 0 && patients.length > 0) {
      loadInitialAppointments();
    }
  }, [dentists, patients]);

  const handleFilterChange = async (e) => {
    const newFilters = { ...filters, [e.target.name]: e.target.value };
    setFilters(newFilters);
  
    if (['dentist', 'patient', 'status'].includes(e.target.name)) {
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
  
    // Validation
    if (!addFormData.patient.trim()) {
      showTemporaryModal('Patient is required.', 'error');
      return;
    }
    if (!existingPatient.includes(addFormData.patient)) {
      showTemporaryModal('Patient does not exist.', 'error');
      return;
    }
  
    if (!addFormData.dentist.trim()) {
      showTemporaryModal('Dentist is required.', 'error');
      return;
    }
    if (!existingDentist.includes(addFormData.dentist)) {
      showTemporaryModal('Dentist does not exist.', 'error');
      return;
    }
    // Match by full name
    const patientObj = patients.find(
      p => `${p.firstname} ${p.lastname}` === addFormData.patient
    );
    const dentistObj = dentists.find(
      d => `${d.firstname} ${d.lastname}` === addFormData.dentist
    );
  
    if (!patientObj || !dentistObj) {
      showTemporaryModal('Patient or Dentist not found in records.', 'error');
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
  
    // Get service IDs
    const selectedServiceIds = addFormData.service
      .map(serviceName => {
        const serviceObj = services.find(s => s.name === serviceName);
        return serviceObj ? serviceObj.idservice : null;
      })
      .filter(id => id !== null);
  
// Convert 12-hour time to 24-hour time
const [timePart, modifier] = addFormData.time.split(' ');
let [hours, minutes] = timePart.split(':').map(Number);

// Adjust for AM/PM
if (modifier === 'PM' && hours < 12) hours += 12;
if (modifier === 'AM' && hours === 12) hours = 0;

// Format to two-digit hour and minute
const formattedTime = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:00`;

// Just combine manually, don’t use new Date() or toISOString()
const combinedDateTime = `${addFormData.date}T${formattedTime}`;

    const newAppointment = {
      idpatient: patientObj.idusers,    // patient idusers
      iddentist: dentistObj.idusers,    // dentist idusers
      date: combinedDateTime,           // combined date and time
      status: 'pending',
      idservice: selectedServiceIds, // => [1, 2, 3]
      notes: '',
    };
  
    console.log('Appointment:', newAppointment);
  
    try {
      const response = await axios.post(baseUrl, newAppointment, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('jwt_token')}`,
        },
      });
  
      if (response.status === 201) {
        setAppointments((prevAppointments) => [
          ...prevAppointments,
          response.data.appointment,
        ]);
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
    }
    finally{
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
          
            // Validation checks similar to handleAddSubmit
            if (!editFormData.patient.trim()) {
              showTemporaryModal('Patient is required.', 'error');
              return;
            }
            if (!existingPatient.includes(editFormData.patient)) {
              showTemporaryModal('Patient does not exist.', 'error');
              return;
            }
          
            if (!editFormData.dentist.trim()) {
              showTemporaryModal('Dentist is required.', 'error');
              return;
            }
            if (!existingDentist.includes(editFormData.dentist)) {
              showTemporaryModal('Dentist does not exist.', 'error');
              return;
            }
          
            // Find patient and dentist objects by full name
            const patientObj = patients.find(
              (p) => `${p.firstname} ${p.lastname}` === editFormData.patient
            );
            const dentistObj = dentists.find(
              (d) => `${d.firstname} ${d.lastname}` === editFormData.dentist
            );
          
            if (!patientObj || !dentistObj) {
              showTemporaryModal('Patient or Dentist not found in records.', 'error');
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
          
            // Validate all services exist
            for (const serviceName of editFormData.service) {
              if (!existingService.includes(serviceName)) {
                showTemporaryModal(`Service "${serviceName}" does not exist.`, 'error');
                return;
              }
            }
            
          
            if (!allowedStatusesForDate.includes(editFormData.status)) {
                showTemporaryModal(`Status "${editFormData.status}" is not allowed for the selected date.`, 'error');
                return;
              }
              
            
            // Map services to IDs for backend submission
            const selectedServiceIds = editFormData.service
              .map((serviceName) => {
                const serviceObj = services.find((s) => s.name === serviceName);
                return serviceObj ? serviceObj.idservice : null;
              })
              .filter((id) => id !== null);
          
            // Convert 12-hour time (e.g. "03:00 PM") to 24-hour format "15:00:00"
            const [timePart, modifier] = editFormData.time.split(' ');
            let [hours, minutes] = timePart.split(':').map(Number);
          
            if (modifier === 'PM' && hours < 12) hours += 12;
            if (modifier === 'AM' && hours === 12) hours = 0;
          
            const formattedTime = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:00`;
          
            // Combine date and time manually
            const combinedDateTime = `${editFormData.date}T${formattedTime}`;
          
            // Prepare appointment update payload
            const updatedAppointment = {
              idpatient: patientObj.idusers,
              iddentist: dentistObj.idusers,
              date: combinedDateTime,
              status: editFormData.status || 'pending',
              idservice: selectedServiceIds,
              notes: editFormData.notes || '',
            };
          
            try {
              const response = await axios.put(`${baseUrl}/${editFormData.id}`, updatedAppointment, {
                headers: {
                  Authorization: `Bearer ${localStorage.getItem('jwt_token')}`,
                },
              });
          
              if (response.status === 200) {
                setAppointments((prevAppointments) =>
                  prevAppointments.map((appt) =>
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
          
          const handleEdit = async (appointment) => {
            try {
              // Fetch services tied to the appointment
              const response = await axios.get(`${API_BASE}/appointment-services/${appointment.idappointment}`);
              const servicesData = response.data.services || [];
          
              // Separate names and IDs
              const serviceNames = servicesData.map(service => service.name);
              const serviceIds = servicesData.map(service => service.idservice);
          
              // Format time
              let timeFormatted = '';
              if (appointment.date) {
                const dateObj = new Date(appointment.date);
                let hours = dateObj.getHours();
                const minutes = dateObj.getMinutes();
                const ampm = hours >= 12 ? 'PM' : 'AM';
                let hours12 = hours % 12 || 12;
                timeFormatted = `${hours12.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')} ${ampm}`;
              }
          
              // Set the edit form data
              setEditFormData({
                id: appointment.idappointment,
                patient: appointment.patientFullname,
                dentist: appointment.dentistFullname,
                date: appointment.date ? appointment.date.split('T')[0] : '',
                time: timeFormatted,
                service: serviceNames,       // For display in tags
                serviceIds: serviceIds,      // For later submission to backend
                serviceInput: '',
                status: appointment.status || 'pending',
                notes: appointment.notes || '',
              });
          console.log('editFormData updated:', editFormData);
              setIsEditing(true);
            } 
            catch (error) {
                console.log('editFormData updated:', editFormData);

                console.error('Error fetching services for editing:', error);
            }
          };
          
  
          
          

  return (
    <div className="container py-4">

        {/* Title and add side by side */}
      <div className="d-flex align-items-center mb-3 gap-4">
        <h2 className="m-0">Appointment Management</h2>
        <button className="add-user-btn" 
         onClick={() => setIsAdding(true)}
    >
</button> 
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
            {patients.map(p => (
              <option key={p.idusers} value={p.idusers}>
                {p.firstname} {p.lastname}
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
            <option value="Completed">Completed</option>
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
      <div className="filter-controls sort-controls mt-2">
  <label htmlFor="usertypeFilter" style={{ margin: 0, fontWeight: '500', whiteSpace: 'nowrap' }}>
    Sort by:
  </label>
  <select
    name="sortBy"
    value={sortBy}
    onChange={handleSortByChange}
    className="form-select sort-select d-inline-block w-auto me-3"
  >
    <option value="idappointment">Appointment ID</option>
    <option value="date">Scheduled Date</option>
    <option value="time">Time</option>
  </select>

  <label htmlFor="usertypeFilter" style={{ margin: 0, fontWeight: '500', whiteSpace: 'nowrap' }}>
    Direction:
  </label>
  <select
    name="sortDirection"
    value={sortDirection}
    onChange={handleSortDirectionChange}
    className="form-select sort-select d-inline-block w-auto"
  >
    <option value="asc">Ascending</option>
    <option value="desc">Descending</option>
  </select>
</div>

      
          <table className="table table-bordered users-table">
            <thead>
              <tr>
                <th>Appointment ID</th>
                <th>Patient Name</th>
                <th>Dentist Name</th>
                <th>Scheduled Date</th>
                <th>Status</th>
                <th className="actions-column"> </th>
              </tr>
            </thead>
            <tbody>
  {sortedAppointments.length === 0 ? (
    <tr><td colSpan="6" className="text-center">No appointments found</td></tr>
  ) : (
    sortedAppointments.map((appointment) => (
      <tr key={appointment.idappointment}>
        <td>{appointment.idappointment}</td>
        <td>{appointment.patientFullname}</td>
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
   
    <input
        type="date"
        name="date"
        value={addFormData.date}
        onChange={handleAddFormChange}
        className="form-control"
        min={new Date(Date.now() + 86400000).toISOString().split("T")[0]} // Tomorrow's date
    />
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
    const allowed = value <= today
      ? ["cancelled", "completed"]
      : ["pending", "approved", "cancelled", "rescheduled"];
    // If current status is not allowed for new date, clear it
    if (!allowed.includes(editFormData.status)) {
      setEditFormData(prev => ({ ...prev, status: "" }));
    }
  }}
  className="form-control"
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
