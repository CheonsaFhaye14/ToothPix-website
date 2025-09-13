import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMoneyBill } from '@fortawesome/free-solid-svg-icons';

export default function EarningsCard({ earnings }) {
  return (
    <div className="col-md-3 col-sm-6">
      <div className="dashboard-card">
        <FontAwesomeIcon icon={faMoneyBill} size="6x" color="#098bdc" />
        <h4 className="dashboard-number">₱{parseFloat(earnings).toFixed(2)}</h4>
        <p className="dashboard-label">This Month's Earnings</p>
      </div>
    </div>
  );
}
