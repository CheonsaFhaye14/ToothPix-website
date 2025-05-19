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

  return (
    <div className="dashboard container py-4">
      <h2>Overview</h2>
      <br></br>
      <div className="row gy-4 gx-2">
      <div className="col-md-3 col-sm-6">
          <div className="dashboard-card">
            <FontAwesomeIcon icon={faHeartbeat} size="2x" color="#87CEFA" />
            <h4 className="dashboard-number">{summary.totalServices}</h4>
            <p className="dashboard-label">Services</p>
          </div>
        </div>

        <div className="col-md-3 col-sm-6">
          <div className="dashboard-card">
            <FontAwesomeIcon icon={faCalendar} size="2x" color="#87CEFA" />
            <h4 className="dashboard-number">{summary.totalAppointments}</h4>
            <p className="dashboard-label">Appointments</p>
          </div>
        </div>

        <div className="col-md-3 col-sm-6">
          <div className="dashboard-card">
            <FontAwesomeIcon icon={faUserDoctor} size="2x" color="#87CEFA" />
            <h4 className="dashboard-number">{summary.totalDentists}</h4>
            <p className="dashboard-label">Dentists</p>
          </div>
        </div>

        <div className="col-md-3 col-sm-6">
          <div className="dashboard-card">
            <FontAwesomeIcon icon={faUser} size="2x" color="#87CEFA" />
            <h4 className="dashboard-number">{summary.totalPatients}</h4>
            <p className="dashboard-label">Patients</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
