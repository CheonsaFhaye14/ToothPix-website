import React from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { saveAs } from 'file-saver';
import Papa from 'papaparse';

export default function PaymentReportExport({ payments = [] }) {
  const sortedPayments = [...payments].sort((a, b) => {
    if (a.patient_name === b.patient_name) {
      const dateA = new Date(a.appointment_date);
      const dateB = new Date(b.appointment_date);
      return dateA - dateB;
    }
    return a.patient_name.localeCompare(b.patient_name);
  });

  const handleDownloadCSV = () => {
    if (!Array.isArray(sortedPayments) || sortedPayments.length === 0) {
      alert('No payment data to export.');
      return;
    }

    const csvData = sortedPayments.map(p => ({
      'Record ID': p.idrecord,
      Patient: p.patient_name.trim() || 'Unknown',
      Dentist: p.dentist_name,
      'Appointment Date': new Date(p.appointment_date).toLocaleString('en-PH'),
      Services: p.services,
      'Total Price': parseFloat(p.total_price).toFixed(2),
      'Total Paid': parseFloat(p.total_paid).toFixed(2),
      'Payment Status': p.paymentstatus,
    }));

    const csv = Papa.unparse(csvData);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, 'payment_report.csv');
  };

  const handleDownloadPDF = () => {
    if (!Array.isArray(sortedPayments) || sortedPayments.length === 0) {
      alert('No payment data to export.');
      return;
    }

    const doc = new jsPDF({ orientation: 'landscape' });
    doc.setFontSize(14);
    doc.text('Dental Payment Report', 14, 15);

    const headers = [[
      'Record ID',
      'Patient',
      'Dentist',
      'Appointment Date',
      'Services',
      'Total Price',
      'Total Paid',
      'Payment Status',
    ]];

    const data = sortedPayments.map(p => [
      p.idrecord,
      p.patient_name.trim() || 'Unknown',
      p.dentist_name,
      new Date(p.appointment_date).toLocaleString('en-PH'),
      p.services,
      parseFloat(p.total_price).toFixed(2),
      parseFloat(p.total_paid).toFixed(2),
      p.paymentstatus,
    ]);

    autoTable(doc, {
      startY: 20,
      head: headers,
      body: data,
      styles: { fontSize: 9 },
      headStyles: { fillColor: [231, 76, 60] },
    });

    doc.save('payment_report.pdf');
  };

  return (
    <div className="mb-3">
      <button onClick={handleDownloadCSV} className="btn btn-primary me-2">
        Export CSV
      </button>
      <button onClick={handleDownloadPDF} className="btn btn-danger">
        Export PDF
      </button>
    </div>
  );
}
