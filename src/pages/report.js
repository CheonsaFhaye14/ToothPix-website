import React, { useEffect, useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../design/dashboard.css'; // Importing the separate CSS file
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHeartbeat, faCalendar, faUserDoctor, faUser } from '@fortawesome/free-solid-svg-icons';

const Dashboard = () => {
  const [summary, setSummary] = useState({
    totalServices: 0,
    totalAppointments: 0,
    totalDentists: 0,
    totalPatients: 0,
  });
  const [showReport, setShowReport] = useState(false);
const [allPatientData, setAllPatientData] = useState([]);
const [selectedPatientId, setSelectedPatientId] = useState(null);
const [filteredData, setFilteredData] = useState([]);

const closeModal = () => {
  setShowReport(false);
};
  
const calculateAge = (birthdateStr) => {
  const birthdate = new Date(birthdateStr);
  const today = new Date();
  let age = today.getFullYear() - birthdate.getFullYear();
  const m = today.getMonth() - birthdate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthdate.getDate())) {
    age--;
  }
  return age;
};
const formatLocalDateTime = (isoDateStr) => {
  if (!isoDateStr) return '';
  const dateObj = new Date(isoDateStr);

  const options = {
    year: 'numeric',
    month: 'long',   // June
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  };

  return dateObj.toLocaleString(undefined, options);
};


  useEffect(() => {
    const fetchSummaryData = async () => {
      try {
        // Fetching data from backend APIs
        const servicesRes = await fetch('https://toothpix-backend.onrender.com/api/app/services');
        const servicesData = await servicesRes.json();
        if (servicesRes.ok) {
          setSummary(prev => ({ ...prev, totalServices: servicesData.services.length }));
        }

        const appointmentsRes = await fetch('https://toothpix-backend.onrender.com/api/app/appointments');
        const appointmentsData = await appointmentsRes.json();
        if (appointmentsRes.ok) {
          setSummary(prev => ({ ...prev, totalAppointments: appointmentsData.appointments.length }));
        }

        const dentistsRes = await fetch('https://toothpix-backend.onrender.com/api/app/dentists');
        const dentistsData = await dentistsRes.json();
        if (dentistsRes.ok) {
          setSummary(prev => ({ ...prev, totalDentists: dentistsData.dentists.length }));
        }

        const patientsRes = await fetch('https://toothpix-backend.onrender.com/api/app/patients');
        const patientsData = await patientsRes.json();
        if (patientsRes.ok) {
          setSummary(prev => ({ ...prev, totalPatients: patientsData.patients.length }));
        }

      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      }
    };

    fetchSummaryData();
  }, []);
const handlePatientsClick = async () => {
  try {
    const response = await fetch(`https://toothpix-backend.onrender.com/api/website/report/patients`);
    const data = await response.json();
    setAllPatientData(data);
    setShowReport(true);
  } catch (error) {
    console.error("Failed to fetch patients report:", error);
  }
};
const handlePatientSelect = (e) => {
  const patientId = parseInt(e.target.value);
  setSelectedPatientId(patientId);
  const patientAppointments = allPatientData.filter(p => p.patient_id === patientId);
  setFilteredData(patientAppointments);
};


  return (
    <div className="dashboard container py-4">
      <h2>Overview</h2>
      <br></br>
      <div className="row gy-4 gx-2">
      <div className="col-md-3 col-sm-6">
          <div className="dashboard-card">
            <FontAwesomeIcon icon={faHeartbeat} size="2x" color="#098bdc" />
            <h4 className="dashboard-number">{summary.totalServices}</h4>
            <p className="dashboard-label">Services</p>
          </div>
        </div>

        <div className="col-md-3 col-sm-6">
          <div className="dashboard-card">
            <FontAwesomeIcon icon={faCalendar} size="2x" color="#098bdc" />
            <h4 className="dashboard-number">{summary.totalAppointments}</h4>
            <p className="dashboard-label">Appointments</p>
          </div>
        </div>

        <div className="col-md-3 col-sm-6">
          <div className="dashboard-card">
            <FontAwesomeIcon icon={faUserDoctor} size="2x" color="#098bdc" />
            <h4 className="dashboard-number">{summary.totalDentists}</h4>
            <p className="dashboard-label">Dentists</p>
          </div>
        </div>

        <div className="col-md-3 col-sm-6">
       <div
  className="dashboard-card"
  onClick={handlePatientsClick}
  style={{ cursor: 'pointer' }}
>
  <FontAwesomeIcon icon={faUser} size="2x" color="#098bdc" />
  <h4 className="dashboard-number">{summary.totalPatients}</h4>
  <p className="dashboard-label">Patients</p>
</div>

        </div>
      </div>
{showReport && (
  <div className="modal-overlay" onClick={closeModal}>
    <div
      className="modal-box report-modal"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      onClick={(e) => e.stopPropagation()}
      style={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '400px',
        padding: '1rem 2rem', // less vertical padding
      }}
    >

      {/* Content changes based on selectedPatientId */}
      {selectedPatientId ? (
        <>
          <div
            style={{
              display: 'flex',
              alignItems: 'center', // vertically center dropdown & title
              justifyContent: 'center', // center title horizontally
              position: 'relative',
              marginBottom: '0.75rem',
              minHeight: '2.5rem',
              width: '100%',
            }}
          >
            {/* Dropdown positioned left */}
            <div
              style={{
                position: 'absolute',
                left: 0,
                minWidth: '200px',
              }}
            >
              <select
                id="patientSelect"
                onChange={handlePatientSelect}
                value={selectedPatientId || ''}
                style={{
                  padding: '0.3rem 0.6rem',
                  fontSize: '1rem',
                  borderRadius: '4px',
                  textAlign: 'center',
                  minWidth: '200px',
                }}
              >
                <option value="">-- Choose Patient --</option>
                {[...new Map(allPatientData.map(p => [p.patient_id, p]))].map(([id, patient]) => (
                  <option key={id} value={id}>
                    {patient.patient_name}
                  </option>
                ))}
              </select>
            </div>

            {/* Title centered */}
            <h2
              id="modal-title"
              className="modal-title"
              style={{
                margin: 0,
                textAlign: 'center',
                width: '100%',
              }}
            >
              Patient Report
            </h2>
          </div>

          {/* Report or no record message with tighter spacing */}
          {filteredData.length > 0 ? (
            <div className="modal-report-grid" style={{ marginBottom: '0.5rem' }}>
           <div className="modal-report-row" style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'center' }}>
  <div className="modal-report-item" style={{ marginBottom: '0.25rem' }}>
    <span className="label">Name:</span>{' '}
    <span>{filteredData[0]?.patient_name || 'N/A'}</span>
  </div>
  <div className="modal-report-item" style={{ marginBottom: '0.25rem', marginLeft: '150px' /* adjust this */ }}>
    <span className="label">Age:</span>{' '}
    <span>{filteredData[0]?.birthdate ? calculateAge(filteredData[0].birthdate) : 'N/A'}</span>
  </div>
  <div className="modal-report-item" style={{ marginBottom: '0.25rem', marginLeft: '100px' /* adjust this */ }}>
    <span className="label">Gender:</span>{' '}
    <span>{filteredData[0]?.gender || 'N/A'}</span>
  </div>
</div>


              <table className="report-table" style={{ marginBottom: '0.5rem' }}>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Dental Description</th>
                    <th>Amount</th>
                  </tr>
                </thead>
           <tbody>
  {filteredData.map((appointment, index) => (
    <tr key={index}>
    <td>{formatLocalDateTime(appointment.appointment_date)}</td>
      <td style={{ padding: '0.25rem 0.5rem' }}>
        <strong>Services availed:</strong>
        <br />
        {appointment.services?.split(', ').map((s, i) => (
          <span key={i}>
            {s}
            <br />
          </span>
        ))}
        <strong>Note from dentist:</strong> {appointment.treatment_notes || 'None'}
        <br />
        <strong>Dentist:</strong> {appointment.doctor_name}
      </td>
      <td style={{ padding: '0.25rem 0.5rem' }}>
        ₱{appointment.total_amount || '0.00'}
      </td>
    </tr>
  ))}
</tbody>

              </table>
            </div>
          ) : (
            <p style={{ textAlign: 'center', marginTop: '0.5rem', width: '100%' }}>
              No record found for this patient.
            </p>
          )}
        </>
      ) : (
       <>
          {/* Title above dropdown when no patient selected */}
          <h2
            id="modal-title"
            className="modal-title"
            style={{
              margin: '0 0 0.75rem 0',
              textAlign: 'center',
              width: '100%',
            }}
          >
            Patient Report
          </h2>

          <div
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              width: '100%',
            }}
          >
            <p style={{ textAlign: 'center', margin: '0 0 0.75rem 0' }}>
              Please select a patient to view their report.
            </p>
            <select
              id="patientSelect"
              onChange={handlePatientSelect}
              value={selectedPatientId || ''}
              style={{
                padding: '0.3rem 0.6rem',
                fontSize: '1rem',
                minWidth: '200px',
                borderRadius: '4px',
                textAlign: 'center',
              }}
            >
              <option value="">-- Choose Patient --</option>
              {[...new Map(allPatientData.map(p => [p.patient_id, p]))].map(([id, patient]) => (
                <option key={id} value={id}>
                  {patient.patient_name}
                </option>
              ))}
            </select>
          </div>
        </>
      )}


      {/* Close button centered horizontally with less top margin */}
      <button
        className="modal-close-button"
        onClick={closeModal}
        style={{
          alignSelf: 'center',
          marginTop: '1rem',
          padding: '0.5rem 1.5rem',
          fontSize: '1rem',
        }}
      >
        Close
      </button>
    </div>
  </div>
)}






    </div>
    
    
  );



};

export default Dashboard;
