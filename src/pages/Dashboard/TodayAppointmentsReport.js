import React, { useEffect, useState } from 'react';
import { BASE_URL } from '../../config';
import { Center } from '@react-three/drei';

export default function TodayAppointmentsReport({ onClose }) {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTodayAppointments = async () => {
      try {
        const res = await fetch(`${BASE_URL}/api/reports/today-appointments`);
        const data = await res.json();

        if (data.appointments) {
          setAppointments(data.appointments);
          setError(null);
        } else if (data.message) {
          setAppointments([]);
          setError(data.message);
        } else {
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

  return (
    <div className="modal-overlay">
      <div className="modal-box">
        <h2>Today's Appointments Report</h2>

        {loading && <p>Loading...</p>}
        {error && <p className="text-danger">{error}</p>}

        {!loading && !error && (
          <>
            {appointments.length > 0 ? (
              <table className="cute-table">
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
          </>
        )}

        <div className="modal-actions" style={{ marginTop: '1.5rem' }}>
          <button className="btn-cancel" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
