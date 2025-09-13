import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserDoctor } from '@fortawesome/free-solid-svg-icons';

export default function TopDentists({ dentists }) {
  return (
    <div className="col-md-6">
      <div className="dashboard-card d-flex flex-column justify-content-between" style={{ height: '100%' }}>
        <div>
          <h4 className="dashboard-label mb-3">Top Dentists</h4>
          <ul className="list-group">
            {dentists.map((dentist, index) => (
              <li key={index} className="list-group-item d-flex justify-content-between align-items-center px-2 py-2">
                <span className="d-flex align-items-center">
                  <FontAwesomeIcon icon={faUserDoctor} className="me-2 text-primary" />
                  {dentist.fullname}
                </span>
                <span className="badge bg-primary rounded-pill">
                  {dentist.patients_helped} Patient
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
