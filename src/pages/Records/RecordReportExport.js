import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { saveAs } from 'file-saver';
import Papa from 'papaparse';
import { formatDateTime } from '../../utils/formatDateTime';
import formBackground from '../../assets/formbackground.png'; // ✅ import the background image
export default function RecordReportExport({ records = [] }) {
  console.log(records);

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


    console.log("CSV export data:", csvData);

    const csv = Papa.unparse(csvData);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, 'record_report.csv');
  };

const handleDownloadPDF = () => {
  if (!Array.isArray(enrichedRecords) || enrichedRecords.length === 0) {
    alert('No records available to export.');
    return;
  }

  const doc = new jsPDF({ orientation: 'portrait' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  const img = formBackground;

  const addBackground = () => {
    doc.addImage(img, 'PNG', 0, 0, pageWidth, pageHeight);
  };

 // First page background
addBackground();

// Title stays white
doc.setFontSize(16);
doc.setTextColor(255, 255, 255);
doc.setFont('helvetica', 'bold');
doc.text('Dental Record Report', pageWidth / 2, 20, { align: 'center' });

// Group by patient
const grouped = enrichedRecords.reduce((acc, r) => {
  const name = r.patient_name?.trim() || 'Unknown';
  if (!acc[name]) acc[name] = [];
  acc[name].push(r);
  return acc;
}, {});

let y = 35;

Object.entries(grouped).forEach(([patient, items], index) => {
  doc.setFontSize(13);
  doc.setTextColor(0, 0, 0); // ✅ patient info in black
  doc.setFont('helvetica', 'normal');
  doc.text(`Patient: ${patient}`, 14, y);
  y += 6;

  const headers = [['ID', 'Dentist', 'Treatment Done', 'Services', 'Treatment Notes', 'Total Price']];
  const body = items.map(r => [
    r.idappointment || 'N/A',
    r.dentist_name || 'Unknown',
    r.formattedDate,
    Array.isArray(r.services)
      ? r.services.map(s => s.name.charAt(0).toUpperCase() + s.name.slice(1).toLowerCase()).join(', ')
      : r.services?.name
        ? r.services.name.charAt(0).toUpperCase() + r.services.name.slice(1).toLowerCase()
        : 'None',
    r.treatment_notes?.replace(/\n/g, ' ') || '',
    r.total_price != null ? r.total_price : '0',
  ]);

autoTable(doc, {
  startY: y,
  head: headers,
  body,
  styles: { fontSize: 9, textColor: [0, 0, 0] }, // table text black
  headStyles: { fillColor: [41, 128, 185], textColor: 255 },
  theme: "striped",
  willDrawPage: () => {
    // ✅ draw background first
    addBackground();

    // Title stays white
    doc.setFontSize(16);
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.text('Dental Record Report', pageWidth / 2, 22, { align: 'center' });

    // Reset to black for rest of content
    doc.setTextColor(0, 0, 0);
  }
});


  y = doc.lastAutoTable.finalY + 12;

  if (y > pageHeight - 30 && index < Object.keys(grouped).length - 1) {
    doc.addPage();
    addBackground();
    y = 25;
  }
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

