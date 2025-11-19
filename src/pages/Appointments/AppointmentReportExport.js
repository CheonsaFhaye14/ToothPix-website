import React from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { saveAs } from 'file-saver';
import Papa from 'papaparse';

const getFormattedDate = (rawDate) => {
  const date = new Date(rawDate);
  return date.toLocaleString('en-PH', {
    timeZone: 'Asia/Manila',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
};

export default function AppointmentReportExport({ appointments }) {
  const handleDownloadCSV = () => {
    const filtered = appointments.map(a => ({
      ID: a.idappointment,
      'Patient Name': a.idpatient ? a.patientFullname : a.patient_name || 'Walk-in',
      'Dentist Name': a.dentistFullname || 'N/A',
      'Scheduled Date': getFormattedDate(a.date || a.formatted_date),
      Status: a.status,
      Notes: a.notes || '',
    }));

    const csv = Papa.unparse(filtered);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, 'appointments_report.csv');
  };

  const handleDownloadPDF = () => {
    const doc = new jsPDF({ orientation: 'landscape' });

    doc.setFontSize(14);
    doc.text('Appointments Report', 14, 15);

    const headers = [[
      'ID',
      'Patient Name',
      'Dentist Name',
      'Scheduled Date',
      'Status',
      'Notes'
    ]];

    const data = appointments.map(a => [
      a.idappointment,
      a.idpatient ? a.patientFullname : a.patient_name || 'Walk-in',
      a.dentistFullname || 'N/A',
      getFormattedDate(a.date || a.formatted_date),
      a.status,
      a.notes || ''
    ]);

    autoTable(doc, {
      startY: 20,
      head: headers,
      body: data,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [41, 128, 185] },
      margin: { left: 14, right: 14 }
    });

    doc.save('appointments_report.pdf');
  };

 return (
  <div className="mb-3" style={{ display: 'flex', gap: '12px' }}>
    <button onClick={handleDownloadCSV} className="btn btn-primary">
      Export CSV
    </button>
    <button onClick={handleDownloadPDF} className="btn btn-danger">
      Export PDF
    </button>
  </div>
);
}
