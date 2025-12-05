import jsPDF from 'jspdf';
import { saveAs } from 'file-saver';
import Papa from 'papaparse';
import { formatDateTime } from '../../utils/formatDateTime';
import formBackground from '../../assets/landscape.png';

export default function AppointmentReportExport({ appointments = [] }) {

  // Pre-compute enriched records for PDF
  const enrichedRecords = appointments.map(a => ({
    ...a,
    formattedDate: formatDateTime(a.date),
  }));

const handleDownloadCSV = () => {
  if (!Array.isArray(appointments) || appointments.length === 0) {
    alert('No appointments available to export.');
    return;
  }


  const filtered = appointments.map(a => ({
    ID: a.idappointment ?? 'N/A',
    'Patient Name': a.patientFullname?.trim() || 'Walk-in',
    'Dentist Name': a.dentistFullname?.trim() || 'N/A',
    'Scheduled Date': a.date ? formatDateTime(a.date) : '—',
    Services: Array.isArray(a.services)
      ? a.services.map(s => s.name?.trim()).join(', ')
      : a.services?.name?.trim() || '—',
    Status: a.status || '—',
    'Created At': a.created_at ? formatDateTime(a.created_at) : '—',
  }));


  try {
    const csv = Papa.unparse(filtered);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, 'appointments_report.csv');
  } catch (error) {
    console.error("CSV export failed:", error);
    alert('Failed to export appointments to CSV.');
  }
};

const handleDownloadPDF = () => {
  if (!Array.isArray(enrichedRecords) || enrichedRecords.length === 0) {
    alert('No records available to export.');
    return;
  }

  const doc = new jsPDF('portrait');
  const img = new Image();
  img.src = formBackground;

  img.onload = () => {
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    // background only
    const addBackground = () => {
      doc.addImage(img, 'PNG', 0, 0, pageWidth, pageHeight);
    };

    // header text only
    const addHeaderText = () => {
      doc.setFontSize(22);
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.text('Appointments Report', pageWidth / 2, 23, { align: 'center' });
    };

    // --- GROUP BY PATIENT ---
    const grouped = enrichedRecords.reduce((acc, r) => {
      const name = r.patientFullname?.trim() || 'Walk-in';
      if (!acc[name]) acc[name] = [];
      acc[name].push(r);
      return acc;
    }, {});

    Object.keys(grouped).forEach((patient, patientIndex) => {
      // new page if not first
      if (patientIndex > 0) {
        doc.addPage();
      }

      // ✅ background first
      addBackground();
      // ✅ then header text
      addHeaderText();

      let y = 40; // start just below title

      // --- PATIENT BOX ---
      const patientTop = y;
      doc.setFontSize(14);
      doc.setTextColor(0, 0, 0);
      doc.setFont('helvetica', 'normal');
      doc.text(`Patient: ${patient}`, 18, y + 8);
      y += 20;

      const boxPadding = 7;
      doc.setDrawColor(0);
      doc.rect(14, patientTop, pageWidth - 28, (y - patientTop) - boxPadding);

      grouped[patient]
        .sort((a, b) => (a.idappointment || 0) - (b.idappointment || 0))
        .forEach((r, index) => {
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

          addLineText('ID', r.idappointment || 'N/A');
          addLineText('Dentist', r.dentistFullname || 'N/A');
          addLineText('Scheduled Date', r.formattedDate || '—');
          addLineText(
            'Services',
            Array.isArray(r.services)
              ? r.services.map(s => s.name).join(', ')
              : (r.services?.name || 'None')
          );
          addLineText('Status', r.status || '—');
          addLineText('Created At', r.created_at ? formatDateTime(r.created_at) : '—');

          // draw record box
          const recordHeight = y - recordTop + 4;
          doc.rect(14, recordTop - 6, pageWidth - 28, recordHeight);

          y += 10;

          // --- PAGE BREAK CHECK ---
          if (y > pageHeight - 30) {
            doc.addPage();
            addBackground();   // ✅ background first
            addHeaderText();   // ✅ then header text
            y = 40;
            const newPatientTop = y;
            doc.setFontSize(14);
            doc.setFont('helvetica', 'normal');
            doc.text(`Patient: ${patient}`, 18, y + 8);
            y += 20;
            doc.rect(14, newPatientTop, pageWidth - 28, (y - newPatientTop) - boxPadding);
          }
        });
    });

    doc.save('appointments_report.pdf');
  };
};


  return (
    <div className="mb-3" style={{ display: 'flex', gap: '12px' }}>
      <button onClick={handleDownloadCSV} className="btn-csv">
        Export CSV
      </button>
      <button onClick={handleDownloadPDF} className="btn-pdf">
        Export PDF
      </button>
    </div>
  );
}
