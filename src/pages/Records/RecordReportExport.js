import React from 'react'; 
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { saveAs } from 'file-saver';
import Papa from 'papaparse';

export default function RecordReportExport({ records = [] }) {
  // Safely sort the records
  const sortedRecords = [...records].sort((a, b) => {
    const nameA = a.patient_name?.trim() || '';
    const nameB = b.patient_name?.trim() || '';
    if (nameA === nameB) {
      const dateA = new Date(a.appointment_date || a.date);
      const dateB = new Date(b.appointment_date || b.date);
      if (dateA.getTime() === dateB.getTime()) {
        return (a.idrecord || 0) - (b.idrecord || 0);
      }
      return dateA - dateB;
    }
    return nameA.localeCompare(nameB);
  });

  const formatDateTime = (inputDate) => {
    const dateObj = new Date(inputDate);
    return isNaN(dateObj)
      ? 'Invalid Date'
      : dateObj.toLocaleString('en-PH', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        });
  };

  const handleDownloadCSV = () => {
    if (!Array.isArray(sortedRecords) || sortedRecords.length === 0) {
      alert('No records available to export.');
      return;
    }

    const csvData = sortedRecords.map(r => ({
      Patient: r.patient_name?.trim() || 'Unknown',
      Dentist: r.dentist_name || 'Unknown',
      'Appointment Date': formatDateTime(r.appointment_date || r.date),
      Services: Array.isArray(r.services)
  ? r.services.map(s => s.name).join(', ')
  : r.services?.name || 'None',

      'Treatment Notes': r.treatment_notes?.replace(/\n/g, ' ') || '',
    }));

    const csv = Papa.unparse(csvData);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, 'record_report.csv');
  };

  const handleDownloadPDF = () => {
    if (!Array.isArray(sortedRecords) || sortedRecords.length === 0) {
      alert('No records available to export.');
      return;
    }

    const doc = new jsPDF({ orientation: 'landscape' });
    doc.setFontSize(14);
    doc.text('Dental Record Report', 14, 15);

    const headers = [
      [ 'Patient', 'Dentist', 'Appointment Date', 'Services', 'Treatment Notes'],
    ];

   const data = sortedRecords.map(r => [
  r.patient_name?.trim() || 'Unknown',
  r.dentist_name || 'Unknown',
  formatDateTime(r.appointment_date || r.date),
  Array.isArray(r.services)
    ? r.services.map(s => s.name).join(', ')
    : r.services?.name || 'None',
  r.treatment_notes?.replace(/\n/g, ' ') || '',
]);


    autoTable(doc, {
      startY: 20,
      head: headers,
      body: data,
      styles: { fontSize: 9 },
      headStyles: { fillColor: [41, 128, 185] },
    });

    doc.save('record_report.pdf');
  };

return (
<div
  className="mb-3"
  style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}
>
  <button onClick={handleDownloadCSV} className="btn-csv">
    Export CSV
  </button>
  <button onClick={handleDownloadPDF} className="btn-pdf">
    Export PDF
  </button>
</div>

);

}
