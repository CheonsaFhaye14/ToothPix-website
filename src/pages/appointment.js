import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faDownload } from '@fortawesome/free-solid-svg-icons';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../design/appointment.css';
import axios from 'axios';

const Appointment = () => {
  const [appointments, setAppointments] = useState([]);
  const [filters, setFilters] = useState({ dentist: '', patient: '', startDate: '', endDate: '' });
  const [dentists, setDentists] = useState([]);
  const [patients, setPatients] = useState([]);

  useEffect(() => {
    // Fetch dentists
    const fetchDentists = async () => {
      try {
        const res = await fetch('https://toothpix-backend.onrender.com/api/app/dentists');
        const data = await res.json();
        if (res.ok) {
          setDentists(data.dentists);
        }
      } catch (error) {
        console.error('Error fetching dentists:', error);
      }
    };

    // Fetch patients
    const fetchPatients = async () => {
      try {
        const res = await fetch('https://toothpix-backend.onrender.com/api/app/patients');
        const data = await res.json();
        if (res.ok) {
          setPatients(data.patients);
        }
      } catch (error) {
        console.error('Error fetching patients:', error);
      }
    };

    fetchDentists();
    fetchPatients();
  }, []);

  const fetchAppointments = async ({ dentist, patient, startDate, endDate }) => {
    try {
      const params = {};

      if (dentist) params.dentist = dentist;
      if (patient) params.patient = patient;
      if (startDate && endDate) {
        params.startDate = startDate;
        params.endDate = endDate;
      }

      const response = await axios.get('/api/app/appointments/search', { params });
      return response.data.appointments;
    } catch (error) {
      console.error('Error fetching appointments:', error);
      return [];
    }
  };

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const applyFilters = async () => {
    const { dentist, patient, startDate, endDate } = filters;
    const data = await fetchAppointments({ dentist, patient, startDate, endDate });
    setAppointments(data);
  };

  const handleExport = () => {
    // Placeholder for CSV export logic
  };

  return (
    <div className="appointment-management-container">
      <h2>Appointment Management</h2>

      <div className="filter-section">
        <div className="row">
          <div className="col-md-3">
            <label>Dentist</label>
            <select name="dentist" value={filters.dentist} onChange={handleFilterChange} className="form-control">
  <option value="">Select Dentist</option>
  {dentists.map(dentist => (
    <option key={dentist.idusers} value={`${dentist.firstname} ${dentist.lastname}`}>
      {dentist.firstname} {dentist.lastname}
    </option>
  ))}
</select>

          </div>

          <div className="col-md-3">
            <label>Patient</label>
            <select name="patient" value={filters.patient} onChange={handleFilterChange} className="form-control">
  <option value="">Select Patient</option>
  {patients.map(patient => (
    <option key={patient.idusers} value={`${patient.firstname} ${patient.lastname}`}>
      {patient.firstname} {patient.lastname}
    </option>
  ))}
</select>

          </div>

          <div className="col-md-3">
            <label>Start Date</label>
            <input
              type="date"
              name="startDate"
              className="form-control"
              value={filters.startDate}
              onChange={handleFilterChange}
            />
          </div>

          <div className="col-md-3">
            <label>End Date</label>
            <input
              type="date"
              name="endDate"
              className="form-control"
              value={filters.endDate}
              onChange={handleFilterChange}
            />
          </div>
        </div>

        <div className="mt-3 text-end">
          <button className="btn btn-primary" onClick={applyFilters}>
            <FontAwesomeIcon icon={faSearch} /> Search
          </button>
        </div>
      </div>

      <div className="appointments-list mt-4">
        <table className="table table-bordered">
          <thead>
            <tr>
              <th>Appointment ID</th>
              <th>Patient Name</th>
              <th>Dentist Name</th>
              <th>Scheduled Date</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
  {appointments.length === 0 ? (
    <tr><td colSpan="6" className="text-center">No appointments found</td></tr>
  ) : (
    appointments.map((appointment) => {
      // Get patient name based on id
      const patient = patients.find(p => p.idusers === appointment.idpatient);
      // Get dentist name based on id
      const dentist = dentists.find(d => d.idusers === appointment.iddentist);

      return (
        <tr key={appointment.idappointment}>
          <td>{appointment.idappointment}</td>
          <td>{patient ? `${patient.firstname} ${patient.lastname}` : "Unknown"}</td>
          <td>{dentist ? `${dentist.firstname} ${dentist.lastname}` : "Unknown"}</td>
          <td>{appointment.date}</td>
          <td>
            <span className={`status ${appointment.status.toLowerCase()}`}>
              {appointment.status}
            </span>
          </td>
          <td>
            <button className="btn btn-warning btn-sm me-2">Modify</button>
            <button className="btn btn-danger btn-sm">Cancel</button>
          </td>
        </tr>
      );
    })
  )}
</tbody>

        </table>
      </div>

      <div className="actions-section mt-3">
        <button className="btn btn-success" onClick={handleExport}>
          <FontAwesomeIcon icon={faDownload} /> Export to CSV
        </button>
      </div>
    </div>
  );
};

export default Appointment;
