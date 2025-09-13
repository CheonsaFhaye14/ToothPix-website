import React from 'react'; 
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTooth } from '@fortawesome/free-solid-svg-icons';

export default function TopServices({ services, onOpenReport }) {
  return (
    <div 
      className="col-md-6" 
      style={{ cursor: 'pointer' }} 
      onClick={onOpenReport}  // <-- triggers modal open
    >
      <div className="dashboard-card">
        <h4 className="dashboard-label mb-3">Top Services</h4>
        <ul className="list-group">
          {services.map((service, index) => (
            <li
              key={index}
              className="list-group-item d-flex justify-content-between align-items-center"
            >
              <FontAwesomeIcon icon={faTooth} className="me-2 text-primary" />
              {service.name}
              <span className="badge bg-primary rounded-pill">
                {service.usage_count} uses
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
