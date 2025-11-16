import React, { useEffect, useState } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import Papa from 'papaparse';
import { BASE_URL } from '../../config';

export default function TodayAppointmentsReport({ onClose }) {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

 useEffect(() => {
  const fetchTodayAppointments = async () => {
    try {
      const res = await fetch(`${BASE_URL}/api/reports/today-appointments`);
      const data = await res.json();

      // If the API returns appointments, set them
      if (data.appointments) {
        setAppointments(data.appointments);
        setError(null); // clear any previous error
      } 
      // If the API returns a message like "No appointments found for today"
      else if (data.message) {
        setAppointments([]);
        setError(data.message); // show the API message
      } 
      else {
        setAppointments([]);
        setError(null);
      }

    } catch (err) {
      setError("Failed to fetch today appointments");
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  };

  fetchTodayAppointments();
}, []);

  const exportCSV = () => {
    if (!appointments.length) return;
    const csv = Papa.unparse(
      appointments.map((a) => ({
        Time: new Date(`1970-01-01T${a.time}:00+08:00`).toLocaleTimeString(
          'en-US',
          { hour: 'numeric', minute: '2-digit', hour12: true, timeZone: 'Asia/Manila' }
        ),
        'Patient Name': a.patient_name,
        Services: a.services,
      }))
    );
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'today_appointments_report.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportPDF = () => {
    if (!appointments.length) return;
    const doc = new jsPDF('portrait');
    doc.text("Today Appointments Report", 14, 15);
    autoTable(doc, {
      head: [['Time', 'Patient Name', 'Services']],
      body: appointments.map((a) => [
        new Date(`1970-01-01T${a.time}:00+08:00`).toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true,
          timeZone: 'Asia/Manila',
        }),
        a.patient_name,
        a.services,
      ]),
    });
    doc.save('today_appointments_report.pdf');
  };

  return (
    <div className="modal-overlay">
      <div className="modal-box">
        <h2>Today's Appointments Report</h2>

        {loading && <p>Loading...</p>}
        {error && <p className="text-danger">{error}</p>}

        {!loading && !error && (
          <>
            {appointments.length > 0 ? (
              <table className="table">
                <thead>
                  <tr>
                    <th>Time</th>
                    <th>Patient Name</th>
                    <th>Services</th>
                  </tr>
                </thead>
                <tbody>
                  {appointments.map((a) => (
                    <tr key={a.idappointment}>
                      <td>
                        {new Date(`1970-01-01T${a.time}:00+08:00`).toLocaleTimeString('en-US', {
                          hour: 'numeric',
                          minute: '2-digit',
                          hour12: true,
                          timeZone: 'Asia/Manila',
                        })}
                      </td>
                      <td>{a.patient_name}</td>
                      <td>{a.services}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="no-data">No appointments for today.</p>
            )}

            <div className="modal-actions">
              {appointments.length > 0 && (
                <>
                  <button className="btn btn-primary" onClick={exportCSV}>
                    Download CSV
                  </button>
                  <button className="btn btn-danger" onClick={exportPDF}>
                    Download PDF
                  </button>
                </>
              )}

             
            </div>
          </>
        )}

          <div className="modal-actions" style={{ marginTop: '1.5rem' }}>
  <button
    className="btn btn-secondary"
    onClick={onClose}
  >
    Close
  </button>
</div>

      </div>
    </div>
  );
}
