import React, { useEffect, useState } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import Papa from 'papaparse';

export default function TodayAppointmentsReport({ onClose }) {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTodayAppointments = async () => {
      try {
        const res = await fetch('https://toothpix-backend.onrender.com/api/reports/today-appointments');
        if (!res.ok) throw new Error('Failed to fetch today appointments');
        const data = await res.json();
        setAppointments(data.appointmentsToday || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTodayAppointments();
  }, []);

  const exportCSV = () => {
    if (!appointments.length) return alert('No data to export');
    const csv = Papa.unparse(
      appointments.map((a) => ({
Time: new Date(`1970-01-01T${a.time}:00+08:00`).toLocaleTimeString('en-US', {
  hour: 'numeric',
  minute: '2-digit',
  hour12: true,
  timeZone: 'Asia/Manila',
}),
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
    if (!appointments.length) return alert('No data to export');
    const doc = new jsPDF('portrait');
    doc.text('Today Appointments Report', 14, 15);
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
  a.services
]),
    });
    doc.save('today_appointments_report.pdf');
  };

  return (
    <div className="modal-overlay">
      <div className="modal-box" style={{ maxWidth: 700 }}>
        <h2>Today's Appointments Report</h2>

        {loading && <p>Loading...</p>}
        {error && <p className="text-danger">{error}</p>}

        {!loading && !error && (
          <>
            {appointments.length > 0 ? (
              <table className="table" style={{ width: '100%', marginBottom: '1rem' }}>
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
              <p style={{ textAlign: 'center', margin: '1rem 0', fontStyle: 'italic' }}>
                No appointments for today.
              </p>
            )}

            <div
              className="modal-actions"
              style={{
                display: 'flex',
                justifyContent: 'center',
                gap: '1rem',
                marginBottom: '1rem',
              }}
            >
              <button className="btn btn-primary" onClick={exportCSV} style={{ minWidth: 120 }}>
                Download CSV
              </button>

              <button className="btn btn-danger" onClick={exportPDF} style={{ minWidth: 120 }}>
                Download PDF
              </button>

              <button className="btn btn-secondary" onClick={onClose} style={{ minWidth: 120 }}>
                Close
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
