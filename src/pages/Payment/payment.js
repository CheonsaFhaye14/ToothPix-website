import React, { useState, useEffect } from 'react';
import '../../design/users.css';
import PaymentReportExport from './PaymentReportExport';
const Payment = () => {
  const [payments, setPayments] = useState([]);
  const [expandedPatient, setExpandedPatient] = useState(null);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [modalAppointment, setModalAppointment] = useState(null);
 const [isEditing, setIsEditing] = useState(false);
const [editFormData, setEditFormData] = useState({
  idappointment: '',
  patient_name: '',
  total_price: '',
  total_paid: '',
  add_payment_amount: '' // 🆕 new field
});
  const [isLoading, setIsLoading] = useState(true);
const [report, setReport] = useState([]);

  const [messageType, setMessageType] = useState('info'); // for modal-box class, e.g. 'info', 'error' etc.
  const [message, setMessage] = useState('');
              const [showModal2, setShowModal2] = useState(false);
        const showTemporaryModal = (msg, type) => {
            setMessage(msg);
            setMessageType(type);
            setShowModal2(true);
            setTimeout(() => {
            setShowModal2(false);
            setMessage('');
            setMessageType('');
            }, 2000);
        };
   const fetchPaymentReport = async () => {
  try {
    const response = await fetch('https://toothpix-backend.onrender.com/api/reports/payments');
    if (!response.ok) {
      throw new Error('Failed to fetch payment report');
    }
    const data = await response.json();
    setReport(data.payments || []);
  } catch (err) {
    console.error('Error fetching payment report:', err.message);
  }
};

        const fetchPayments = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('https://toothpix-backend.onrender.com/api/website/payment');
      if (!response.ok) {
        throw new Error('Failed to fetch payment data');
      }
      const data = await response.json();
      
      // Filter out payments with 'paid' status
      const filteredPayments = data.payments.filter(payment => payment.paymentstatus.toLowerCase() !== 'paid');
      
      setPayments(filteredPayments || []); // Set filtered payments
    } catch (err) {
    } finally {
      setIsLoading(false);
    }
  };
useEffect(() => {
  

  fetchPayments();
  fetchPaymentReport();
}, []);


const formatAppointmentDate = (isoDateStr) => {
  if (!isoDateStr) return '';

  const dateObj = new Date(isoDateStr); // local time

  const options = {
    month: 'short',    // Jun
    day: 'numeric',    // 11
    year: 'numeric',   // 2025
    hour: '2-digit',   // 11
    minute: '2-digit', // 00
    hour12: true       // AM/PM
  };

  return dateObj.toLocaleString(undefined, options);
};


  const toggleExpanded = (patientName) => {
    setExpandedPatient(expandedPatient === patientName ? null : patientName);
  };

  const openAppointmentModal = (appt) => {
    setModalAppointment(appt);
    setShowInfoModal(true);
  };

  const closeModal = () => {
    setShowInfoModal(false);
    setModalAppointment(null);
  };




  const groupedByPatient = payments.reduce((acc, payment) => {
    const key = (payment.patient_name || 'Unknown').toLowerCase();
    if (!acc[key]) acc[key] = [];
    acc[key].push(payment);
    return acc;
  }, {});

  const patientKeys = Object.keys(groupedByPatient).sort();

  //edit 
  const handleEditFormChange = (e) => {
  const { name, value } = e.target;
  setEditFormData(prev => ({
    ...prev,
    [name]: value,
  }));
};
const handleMarkAsPaid = async (payment) => {
  const { idappointment, total_price } = payment;

  try {
    const response = await fetch(`https://toothpix-backend.onrender.com/api/website/payment/${idappointment}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        total_paid: total_price,
        total_price: total_price,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to mark as paid');
    }

    const result = await response.json();

    setPayments((prev) =>
      prev.map((p) =>
        p.idappointment === idappointment
          ? {
              ...p,
              total_paid: result.updatedRecord.total_paid,
              paymentstatus: result.updatedRecord.paymentstatus,
              still_owe: 0,
            }
          : p
      )
    );

    fetchPayments();
    fetchPaymentReport();
  } catch (error) {
    console.error('Error marking as paid:', error);
  }
};



const openEditModal = (payment) => {
  setEditFormData({
    idappointment: payment.idappointment,
    patient_name: payment.patient_name,
    total_price: payment.total_price,
    total_paid: payment.total_price, // Automatically set full payment
  });
  setIsEditing(true);
};


const [searchTerm, setSearchTerm] = useState('');
const [filterStatus, setFilterStatus] = useState('all');
const [sortKey, setSortKey] = useState('');
const [sortDirection, setSortDirection] = useState('asc');

// Filter and sort logic applied on grouped data
const filteredPayments = patientKeys
  .map((patientKey) => {
    let paymentsForPatient = groupedByPatient[patientKey];
    const patientDisplayName = paymentsForPatient[0]?.patient_name || 'Unknown';

    // Apply Search Filter by Patient Name
    if (searchTerm && !patientDisplayName.toLowerCase().includes(searchTerm.toLowerCase())) {
      return null; // skip this patient if search term doesn't match
    }

    // Apply Status Filter (only on main patient list)
    if (filterStatus !== 'all') {
      paymentsForPatient = paymentsForPatient.filter(
        (payment) => payment.paymentstatus.toLowerCase() === filterStatus
      );
    }

    return {
      patientKey,
      patientDisplayName,
      paymentsForPatient,
    };
  })
  .filter(Boolean); // Filter out null values (patients not matching search)

// Apply Sorting to filtered payments
if (sortKey) {
  filteredPayments.sort((a, b) => {
    const fieldA = sortKey === 'date' ? new Date(a.paymentsForPatient[0]?.date) : a[sortKey];
    const fieldB = sortKey === 'date' ? new Date(b.paymentsForPatient[0]?.date) : b[sortKey];

    if (sortDirection === 'asc') {
      return fieldA < fieldB ? -1 : 1;
    } else {
      return fieldA < fieldB ? 1 : -1;
    }
  });
}

return (
  <div className="container mt-4">
    {/* Title and add side by side */}
   <div className="d-flex align-items-center justify-content-between mb-3 flex-wrap gap-3">
     {/* Left side: Title + Add Button */}
     <div className="d-flex align-items-center gap-3">
       <h2 className="m-0">Payment Management</h2>
     </div>
   
     {/* Right side: Export buttons (PASS enriched data) */}
<PaymentReportExport payments={report} />
   </div>
    {isLoading ? (
      <div className="loading-text">Loading...</div>
    ) : (
      <>
        {/* Search and Filter Controls */}
        <div className="filter-controls d-flex gap-2 mb-3 align-items-center">
          {/* Search Input */}
          <input
            type="text"
            className="form-control search-input search-margin-top"
            placeholder="Search by patient name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          {/* Status Filter */}
          <select
            className="form-select sort-select"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="all">All</option>
            <option value="unpaid">Unpaid</option>
            <option value="partial">Partial</option>
          </select>

          {/* Sort By Dropdown */}
          <select
            className="form-select sort-select"
            value={sortKey}
            onChange={(e) => setSortKey(e.target.value)}
          >
            <option value="">Sort By</option>
            <option value="patientDisplayName">Patient Name</option>
            <option value="date">Appointment Date</option>
          </select>

          {/* Sort Direction */}
          <select
            className="form-select sort-direction"
            value={sortDirection}
            onChange={(e) => setSortDirection(e.target.value)}
          >
            <option value="asc">Asc</option>
            <option value="desc">Desc</option>
          </select>
        </div>

        {/* Payments Table */}
        <table className="table table-bordered users-table">
          <thead>
            <tr>
              <th>Patient Name</th>
            </tr>
          </thead>
          <tbody>
            {filteredPayments.length === 0 ? (
              <tr>
                <td className="text-center" colSpan="5">No payments found</td>
              </tr>
            ) : (
              filteredPayments.map(({ patientKey, patientDisplayName, paymentsForPatient }) => {
                const isExpanded = expandedPatient === patientKey;

                // Apply Status Filter on the expanded payments table (only unpaid and partial)
                if (filterStatus !== 'all') {
                  paymentsForPatient = paymentsForPatient.filter(
                    (payment) => payment.paymentstatus.toLowerCase() === filterStatus
                  );
                }

                // Apply Sorting on the expanded payments table
                if (sortKey) {
                  paymentsForPatient.sort((a, b) => {
                    const fieldA = sortKey === 'date' ? new Date(a.date) : a[sortKey];
                    const fieldB = sortKey === 'date' ? new Date(b.date) : b[sortKey];

                    if (sortDirection === 'asc') {
                      return fieldA < fieldB ? -1 : 1;
                    } else {
                      return fieldA < fieldB ? 1 : -1;
                    }
                  });
                }

                return (
                  <React.Fragment key={patientKey}>
                    <tr
                      onClick={() => toggleExpanded(patientKey)}
                      style={{ cursor: 'pointer', backgroundColor: isExpanded ? '#f1f1f1' : '' }}
                    >
                      <td>{patientDisplayName}</td>
                    </tr>

                    {isExpanded && (
                      <tr>
                        <td colSpan="1">
                          <table className="table table-sm mb-0 expanded-inner-table">
                            <thead>
                              <tr>
                                <th>Scheduled Date</th>
                                <th>Status</th>
                                <th className="actions-column"></th>
                              </tr>
                            </thead>
                            <tbody>
                              {paymentsForPatient.length === 0 ? (
                                <tr>
                                  <td colSpan="3" className="text-center">No payments found</td>
                                </tr>
                              ) : (
                                paymentsForPatient.map((payment) => (
                                  <tr
                                    key={payment.idappointment}
                                    style={{ cursor: 'pointer' }}
                                    onClick={() => openAppointmentModal(payment)}
                                  >
                                    <td>{formatAppointmentDate(payment.date)}</td>
                                    <td>
                                      <span className={`status ${payment.paymentstatus.toLowerCase()}`}>
                                        {payment.paymentstatus.charAt(0).toUpperCase() + payment.paymentstatus.slice(1)}
                                      </span>
                                    </td>
                                    <td className="actions-column" onClick={(e) => e.stopPropagation()}>
                                      <button
                                        className="btn-edit me-2"
                                        onClick={() => handleMarkAsPaid(payment)}
                                      >
                                      Mark as Paid
                                      </button>
                                    </td>
                                  </tr>
                                ))
                              )}
                            </tbody>
                          </table>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })
            )}
          </tbody>
        </table>
      </>
    )}

    {showInfoModal && modalAppointment && (
  <div className="modal-overlay" onClick={closeModal}>
    <div className="modal-box info-modal" onClick={(e) => e.stopPropagation()}>
      <h2 className="modal-title">Record Information</h2>

      <div className="modal-info-grid">
        <div className="modal-info-row">
          <span className="label">Patient:</span>
          <span>{modalAppointment.patient_name}</span>
        </div>
        <div className="modal-info-row">
          <span className="label">Dentist:</span>
          <span>{modalAppointment.dentist_name}</span>
        </div>
        <div className="modal-info-row">
          <span className="label">Date:</span>
          <span>{formatAppointmentDate(modalAppointment.date)}</span>
        </div>
        <div className="modal-info-row">
          <span className="label">Services:</span>
          <span>
            {(modalAppointment.services_with_prices || '').split(', ').map((service, idx) => (
              <div key={idx}>{service}</div>
            ))}
          </span>
        </div>
        <div className="modal-info-row">
          <span className="label">Total Price:</span>
          <span>₱{modalAppointment.total_price}</span>
        </div>
        <div className="modal-info-row">
          <span className="label">Total Paid:</span>
          <span>₱{modalAppointment.total_paid}</span>
        </div>
        <div className="modal-info-row">
          <span className="label">Still Owe:</span>
          <span>₱{modalAppointment.still_owe}</span>
        </div>
      </div>

      <button className="modal-close-button" onClick={closeModal}>
        Close
      </button>
    </div>
  </div>
)}



 {showModal2 && (
  <div className="modal-overlay">
    <div className={`modal-box ${messageType}`}>
      <p>{message}</p>
    </div>
  </div>
)}
    </div>
  );
};

export default Payment;
