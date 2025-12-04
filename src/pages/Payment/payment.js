import React, { useState, useEffect } from 'react';
import { BASE_URL } from '../../config';
import PaymentReportExport from './PaymentReportExport';
import FloatingInput from '../../utils/InputForm';
import { formatDateTime } from '../../utils/formatDateTime';
import ShowInfoModal from '../../Components/ShowInfoModal/ShowInfoModal';
import InstallmentModal from '../../Components/AddModal/InstallmentModal';

const Payment = () => {
  const [payments, setPayments] = useState([]);
  const [expandedPatient, setExpandedPatient] = useState(null);
const [modalRow, setModalRow] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [showAll, setShowAll] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [report, setReport] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
const [modalData, setModalData] = useState(null);
   // ✅ Add missing filter/sort state
  const [filterStatus, setFilterStatus] = useState('all'); // 'all' | 'paid' | 'unpaid' | 'partial'
  const [sortKey, setSortKey] = useState(null);            // 'date' or other field
  const [sortDirection, setSortDirection] = useState('asc');

const fetchPaymentReport = async () => {
  try {
    const response = await fetch(`${BASE_URL}/api/reports/payments`);
    if (!response.ok) {
      throw new Error('Failed to fetch payment report');
    }
    const data = await response.json();
    setReport(data.payments || []);
  } catch (err) {
    console.error('Error fetching payment report:', err.message);
  }
};
// Example reset function
 const handleReset = () => {
    setSearchTerm('');
    setCurrentPage(1);
    setShowAll(false);
    setFilterStatus('all');
    setSortKey(null);
    setSortDirection('asc');
  };
// ✅ Sorting handler
const handleSort = (key) => {
  if (sortKey === key) {
    // toggle direction if same column clicked
    setSortDirection(sortDirection === "asc" ? "desc" : "asc");
  } else {
    setSortKey(key);
    setSortDirection("asc");
  }
};


// Example disabled state (true if nothing to reset)
const isResetDisabled = searchTerm === "" && !showAll && currentPage === 1;

const fetchPayments = async () => {
  try {
    setIsLoading(true);
    const response = await fetch(`${BASE_URL}/api/website/payment`);
    if (!response.ok) {
      throw new Error('Failed to fetch payment data');
    }
    const data = await response.json();

    // Filter out payments with 'paid' status
    const filteredPayments = data.payments.filter(
      (payment) => payment.paymentstatus.toLowerCase() !== 'paid'
    );

    // Each payment now has payment.services as an array of objects
    setPayments(filteredPayments || []);
  } catch (err) {
    console.error('Error fetching payments:', err.message);
  } finally {
    setIsLoading(false);
  }
};
useEffect(() => {
  

  fetchPayments();
  fetchPaymentReport();
}, []);

 const toggleExpanded = (patientName) => {
    setExpandedPatient(expandedPatient === patientName ? null : patientName);
  };

const openAppointmentModal = (row) => {
  setModalRow(row);
};

const closeModal = () => {
  setModalRow(null);
};

const groupedByPatient = payments.reduce((acc, payment) => {
    const key = (payment.patient_name || 'Unknown').toLowerCase();
    if (!acc[key]) acc[key] = [];
    acc[key].push(payment);
    return acc;
  }, {});

  const patientKeys = Object.keys(groupedByPatient).sort();
 // ✅ Build filteredPayments array for rendering
  const filteredPayments = patientKeys.map((key) => ({
    patientKey: key,
    patientDisplayName: groupedByPatient[key][0].patient_name || 'Unknown',
    paymentsForPatient: groupedByPatient[key],
  }));

const handleMarkAsPaid = async (payment, selectedMonths = {}) => {
  const { idappointment, total_price } = payment;

  try {
 
    const adminId = localStorage.getItem("adminId");
    if (!adminId) throw new Error("Admin ID missing");

    let payload = {
      admin_id: adminId
    };

    if (Object.keys(selectedMonths).length > 0) {
      // Installment mode
      const [svcName] = Object.keys(selectedMonths);
      const installmentNumber = selectedMonths[svcName];

      const svc = payment.services.find(s => s.name === svcName);
      if (!svc) throw new Error("Service not found");

   
      // Backend expects AMOUNT = exact installment payment
      const amount = svc.price / svc.installment_times;

      payload.installment_number = installmentNumber;
      payload.amount = amount;


    } else {
    }

    const response = await fetch(`${BASE_URL}/api/website/payment/${idappointment}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("jwt_token")}`
      },
      body: JSON.stringify(payload)
    });

   

    if (!response.ok) throw new Error("Failed to mark as paid");

    const result = await response.json();

    setPayments(prev =>
      prev.map(p =>
        p.idappointment === idappointment
          ? {
              ...p,
              total_paid: result.updatedRecord.total_paid,
              paymentstatus: result.updatedRecord.paymentstatus,
              still_owe: Math.max(parseFloat(total_price) - result.updatedRecord.total_paid, 0)
            }
          : p
      )
    );

    fetchPayments();
    fetchPaymentReport();

  } catch (error) {
    console.error("❌ Error marking as paid:", error);
  }
};



const pageSize = 5; // number of patients per page

let paginatedPayments = filteredPayments;
if (!showAll) {
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  paginatedPayments = filteredPayments.slice(startIndex, endIndex);
}

const totalPages = Math.ceil(filteredPayments.length / pageSize);

return (
  <div className="container mt-4">
    {/* Title and add side by side */}
   <div className="d-flex align-items-center justify-content-between mb-3 flex-wrap gap-3">
     {/* Left side: Title + Add Button */}
     <div className="d-flex align-items-center gap-3">
       <div className="same-row">
       <h1>Payment Management</h1>
     
   <div className='report-section'>
     {/* Right side: Export buttons (PASS enriched data) */}
<PaymentReportExport payments={report} />
   </div>
   </div>
   </div>
   </div>
{isLoading ? (
  <div className="loading-text">Loading...</div>
) : (
 <>
  {/* Payments Table */}
  <div className="table-wrapper">
    {/* Search and Filter Controls */}
    <div className="filter-controls">
      <div className="one-row">
        <FloatingInput
          className="one-row-input"
          placeholder="Search by patient name..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1); // reset to first page when searching
          }}
        />
        <div className="buttons">
          <button
            className="Showall-btn"
            onClick={() => setShowAll((prev) => !prev)}
          >
            {showAll ? "Paginate" : "Show All"}
          </button>

          <button
            onClick={handleReset}
            disabled={isResetDisabled}
            className="reset-btn"
          >
            Reset
          </button>
        </div>
      </div>
    </div>

<table className="custom-table">
  <thead>
    <tr>
      <th onClick={() => handleSort("patient_name")}>
        Patient Name{" "}
        {sortKey === "patient_name" &&
          (sortDirection === "asc" ? "▲" : "▼")}
      </th>
    </tr>
  </thead>
  <tbody>
    {paginatedPayments.length === 0 ? (
      <tr>
        <td className="text-center" colSpan="1">
          No payments found
        </td>
      </tr>
    ) : (
      // ✅ Sort patients before rendering
      [...paginatedPayments].sort((a, b) => {
        if (sortKey === "patient_name") {
          const nameA = a.patientDisplayName.toLowerCase();
          const nameB = b.patientDisplayName.toLowerCase();
          if (nameA < nameB) return sortDirection === "asc" ? -1 : 1;
          if (nameA > nameB) return sortDirection === "asc" ? 1 : -1;
          return 0;
        }
        return 0;
      }).map(({ patientKey, patientDisplayName, paymentsForPatient }) => {
        const isExpanded = expandedPatient === patientKey;

        // Apply Status Filter
        let visiblePayments = paymentsForPatient;
        if (filterStatus !== "all") {
          visiblePayments = visiblePayments.filter(
            (payment) =>
              payment.paymentstatus.toLowerCase() === filterStatus
          );
        }

        // Apply Sorting for inner table
        let sortedPayments = [...visiblePayments];
        if (sortKey === "date" || sortKey === "paymentstatus") {
          sortedPayments.sort((a, b) => {
            const fieldA =
              sortKey === "date" ? new Date(a.date) : a[sortKey];
            const fieldB =
              sortKey === "date" ? new Date(b.date) : b[sortKey];

            if (fieldA < fieldB) return sortDirection === "asc" ? -1 : 1;
            if (fieldA > fieldB) return sortDirection === "asc" ? 1 : -1;
            return 0;
          });
        }

        return (
          <React.Fragment key={patientKey}>
            <tr
              onClick={() => toggleExpanded(patientKey)}
style={{
  cursor: 'pointer',
  backgroundColor: isExpanded ? '#eef8fcff' : '',
  fontWeight: isExpanded ? 'bold' : 'normal'
}}

            >
              <td>{patientDisplayName}</td>
            </tr>

            {isExpanded && (
              <tr>
                <td colSpan="1">
                  <table className="expanded-inner-table">
                    <thead>
                      <tr>
                        <th onClick={() => handleSort("date")}>
                          Scheduled Date{" "}
                          {sortKey === "date" &&
                            (sortDirection === "asc" ? "▲" : "▼")}
                        </th>
                        <th onClick={() => handleSort("paymentstatus")}>
                          Status{" "}
                          {sortKey === "paymentstatus" &&
                            (sortDirection === "asc" ? "▲" : "▼")}
                        </th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sortedPayments.length === 0 ? (
                        <tr>
                          <td colSpan="3" className="text-center">
                            No payments found
                          </td>
                        </tr>
                      ) : (
                        sortedPayments.map((payment) => (
                          <tr
                            key={payment.idappointment}
                            style={{ cursor: "pointer" }}
                            onClick={() => openAppointmentModal(payment)}
                          >
                            <td>{formatDateTime(payment.date)}</td>
                            <td>
                              <span
                                className={`status ${payment.paymentstatus.toLowerCase()}`}
                              >
                                {payment.paymentstatus.charAt(0).toUpperCase() +
                                  payment.paymentstatus.slice(1)}
                              </span>
                            </td>
                            <td
                              className="action-buttons"
                              onClick={(e) => e.stopPropagation()}
                            >
<button
  className="btn-edit"
  onClick={() => {
    // Always open modal
    setModalData({ payment, services: payment.services });
    setModalOpen(true);
  }}
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
{!showAll && totalPages > 0 && (
  <div className="pagination">
    <button
      disabled={currentPage === 1}
      onClick={() => setCurrentPage(p => p - 1)}
    >
      Prev
    </button>
    <span>Page {currentPage} of {totalPages || 1}</span>
    <button
      disabled={currentPage === totalPages}
      onClick={() => setCurrentPage(p => p + 1)}
    >
      Next
    </button>
  </div>
)}

  </div>
</>
)}
{modalRow && (
  <ShowInfoModal
    row={modalRow}
    onClose={closeModal}
    fields={[
      { key: "patient_name", label: "Patient" },
      { key: "dentist_name", label: "Dentist" },
      { key: "date", label: "Appointment Date" },
      { key: "services_with_prices", label: "Services" },
      { key: "total_price", label: "Total Price" },
      { key: "total_paid", label: "Total Paid" },
      { key: "still_owe", label: "Still Owe" },
    ]}
  />
)}
<InstallmentModal
  open={modalOpen}
  services={modalData?.services}
  onConfirm={(selectedMonths, total) => {
    setModalOpen(false);
    handleMarkAsPaid(modalData.payment, selectedMonths, total);
  }}
  onClose={() => setModalOpen(false)}
/>




    </div>
  );
};

export default Payment;
