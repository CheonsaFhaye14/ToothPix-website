import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendar } from '@fortawesome/free-solid-svg-icons';

export default function AppointmentTodayCard({ count, onClick }) {
  return (
    <div className="col-md-3 col-sm-6" style={{ cursor: 'pointer' }} onClick={onClick}>
      <div className="dashboard-card">
        <FontAwesomeIcon icon={faCalendar} size="6x" color="#098bdc" />
        <h4 className="dashboard-number">{count}</h4>
        <p className="dashboard-label">Appointments Today</p>
      </div>
    </div>
  );
}
