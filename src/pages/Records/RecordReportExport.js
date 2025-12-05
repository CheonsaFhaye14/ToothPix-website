import jsPDF from 'jspdf';
import { saveAs } from 'file-saver';
import Papa from 'papaparse';
import { formatDateTime } from '../../utils/formatDateTime';
import formBackground from '../../assets/formbackground.png'; // ✅ import the background image
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

  // ✅ Pre-compute formattedDate once per record
  const enrichedRecords = sortedRecords.map(r => ({
    ...r,
    formattedDate: formatDateTime(r.appointment_date || r.date),
  }));

  const handleDownloadCSV = () => {
    if (!Array.isArray(enrichedRecords) || enrichedRecords.length === 0) {
      alert('No records available to export.');
      return;
    }

  const csvData = enrichedRecords.map(r => ({
  ID: r.idappointment || 'N/A',
  Patient: r.patient_name?.trim() || 'Unknown',
  Dentist: r.dentist_name || 'Unknown',
  'Treatment Done': r.formattedDate,
  Services: Array.isArray(r.services)
    ? r.services.map(s => s.name.charAt(0).toUpperCase() + s.name.slice(1).toLowerCase()).join(', ')
    : r.services?.name
      ? r.services.name.charAt(0).toUpperCase() + r.services.name.slice(1).toLowerCase()
      : 'None',
  'Treatment Notes': r.treatment_notes?.replace(/\n/g, ' ') || '',
  'Total Price': r.total_price != null ? r.total_price : '0',
}));



    const csv = Papa.unparse(csvData);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, 'record_report.csv');
  };
    const capitalizeWords = (str) => {
  if (!str || typeof str !== 'string') return str;
  return str
    .split(' ')
    .map(word => word.length > 0 ? word[0].toUpperCase() + word.slice(1).toLowerCase() : '')
    .join(' ');
};


const handleDownloadPDF = () => {
  if (!Array.isArray(enrichedRecords) || enrichedRecords.length === 0) {
    alert('No records available to export.');
    return;
  }

  // ✅ Log the enriched records before processing

  const doc = new jsPDF('portrait');
  const img = new Image();
  img.src = formBackground;

  img.onload = () => {
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    // --- HEADER ---
    const addHeader = () => {
      doc.addImage(img, 'PNG', 0, 0, pageWidth, pageHeight);
      doc.setFontSize(22);
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.text('Dental Record Report', pageWidth / 2, 23, { align: 'center' });
    };

    // --- GROUP BY PATIENT ---
    const grouped = enrichedRecords.reduce((acc, r) => {
      const name = r.patient_name?.trim() || 'Unknown';
      if (!acc[name]) acc[name] = [];
      acc[name].push(r);
      return acc;
    }, {});

    // ✅ Log grouped data

    Object.keys(grouped).forEach((patient, patientIndex) => {
if (patientIndex > 0) {
  doc.addPage();
  addHeader();
} else {
  addHeader();
}

// reset text color back to black after header
doc.setTextColor(0, 0, 0);

let y = 40;

      // --- PATIENT BOX ---
      const patientTop = y;
      doc.setFontSize(14);
      doc.setTextColor(0, 0, 0);
      doc.setFont('helvetica', 'normal');
      doc.text(`Patient: ${capitalizeWords(patient)}`, 18, y + 8);
      y += 20;

      const boxPadding = 7;
      doc.setDrawColor(0);
      doc.rect(14, patientTop, pageWidth - 28, (y - patientTop) - boxPadding);

      grouped[patient]
        .sort((a, b) => a.idappointment - b.idappointment)
        .forEach((record, index) => {
          // ✅ Log each record before drawing

          const recordTop = y + 6;
          y = recordTop;

          doc.setFontSize(12);
          doc.setFont('helvetica', 'bold');
          doc.text(`Appointment: ${index + 1}`, 18, y);
          y += 10;

          doc.setFontSize(10);
          doc.setFont('helvetica', 'normal');

          const addLineText = (label, value) => {
            doc.text(`${label}: ${value}`, 24, y);
            doc.setDrawColor(0);
            doc.line(22, y + 2, pageWidth - 22, y + 2);
            y += 8;
          };

          addLineText('ID', record.idappointment || 'N/A');
          addLineText('Dentist', record.dentist_name || 'Unknown');
          addLineText('Date', record.formattedDate || '—');
          addLineText(
            'Services',
            Array.isArray(record.services)
              ? record.services.map(s => capitalizeWords(s.name)).join(', ')
              : record.services?.name
                ? capitalizeWords(record.services.name)
                : 'None'
          );
          addLineText('Treatment Notes', record.treatment_notes?.replace(/\n/g, ' ') || '—');
          addLineText('Total Price', record.total_price != null ? `PHP ${parseFloat(record.total_price).toFixed(2)}` : 'PHP 0.00');

          // draw record box
          const recordHeight = y - recordTop + 4;
          doc.rect(14, recordTop - 6, pageWidth - 28, recordHeight);

          y += 10;

        // --- PAGE BREAK CHECK ---
if (y > pageHeight - 30) {
  doc.addPage();
  addHeader();

  // reset text color back to black after header
  doc.setTextColor(0, 0, 0);

  y = 40;
  const newPatientTop = y;
  doc.setFontSize(14);
  doc.setFont('helvetica', 'normal');
  doc.text(`Patient: ${capitalizeWords(patient)}`, 18, y + 8);
  y += 20;
  doc.rect(14, newPatientTop, pageWidth - 28, (y - newPatientTop) - boxPadding);
}

        });
    });

    doc.save('record_report.pdf');
  };
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

