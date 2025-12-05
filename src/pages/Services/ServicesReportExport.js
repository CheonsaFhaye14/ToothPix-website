import { jsPDF } from 'jspdf';
import { saveAs } from 'file-saver';
import Papa from 'papaparse';
import formBackground from '../../assets/formbackground.png'; // ✅ import background
import { formatDateTime } from '../../utils/formatDateTime.jsx';
import 'jspdf-autotable';

export default function ServicesReportExport({ services }) {
  const handleDownloadCSV = () => {
    const sortedServices = [...services].sort((a, b) => a.idservice - b.idservice);
// Capitalize only the first letter of words, rest lowercase

    // Filter out unwanted fields and conditionally include installment_times
    const filteredServices = sortedServices.map(s => {
      const base = {
        ID: s.idservice,
        Name: s.name,
        Description: s.description || '—',
        Price: `PHP ${parseFloat(s.price).toFixed(2)}`,
        Category: s.category || '—',
        CreatedAt: s.created_at ? formatDateTime(s.created_at) : '—',
      };
      if (s.installment) {
        base.InstallmentTimes = s.installment_times || '—';
      }
      return base;
    });

    const csv = Papa.unparse(filteredServices, { quotes: false });
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, 'services_report.csv');
  };

  const capitalizeWords = (str) => {
  if (!str || typeof str !== 'string') return str;
  return str
    .split(' ')
    .map(word => word.length > 0 ? word[0].toUpperCase() + word.slice(1).toLowerCase() : '')
    .join(' ');
};

const handleDownloadPDF = () => {
  if (!services.length) return;

  const doc = new jsPDF('portrait');
  const img = new Image();
  img.src = formBackground;

  img.onload = () => {
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    const addHeader = () => {
      doc.addImage(img, 'PNG', 0, 0, pageWidth, pageHeight);
      doc.setFontSize(22);
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.text('Services Report', pageWidth / 2, 23, { align: 'center' });
    };

    const grouped = services.reduce((acc, s) => {
      const cat = s.category || 'Uncategorized';
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(s);
      return acc;
    }, {});

    Object.keys(grouped).forEach((category, catIndex) => {
      if (catIndex > 0) {
        doc.addPage();
        addHeader();
      } else {
        addHeader();
      }

      let y = 40; // start below title

      // --- CATEGORY BOX ---
      const catTop = y;
      doc.setFontSize(14);
      doc.setTextColor(0, 0, 0);
      doc.setFont('helvetica', 'normal');
      doc.text(`Category: ${capitalizeWords(category)}`, 18, y + 8);
      y += 20;

      const boxPadding = 7;
      doc.setDrawColor(0);
      doc.rect(14, catTop, pageWidth - 28, (y - catTop) - boxPadding);

      grouped[category]
        .sort((a, b) => a.idservice - b.idservice)
        .forEach((s, index) => {
          const serviceTop = y + 6;
          y = serviceTop;

          doc.setFontSize(12);
          doc.setFont('helvetica', 'bold');
          doc.text(`Service: ${index + 1}`, 18, y);
          y += 10;

          doc.setFontSize(10);
          doc.setFont('helvetica', 'normal');

          const addLineText = (label, value) => {
            doc.text(`${label}: ${value}`, 24, y);
            doc.setDrawColor(0);
            doc.line(22, y + 2, pageWidth - 22, y + 2);
            y += 8;
          };

          addLineText('ID', s.idservice);
          addLineText('Name', capitalizeWords(s.name));
          addLineText('Description', s.description || '—');
          addLineText('Price', `PHP ${parseFloat(s.price).toFixed(2)}`);
          addLineText('Created At', s.created_at ? formatDateTime(s.created_at) : '—');
          if (s.installment) {
            addLineText('Installment Times', capitalizeWords(s.installment_times) || '—');
          }

          // draw service box
          const serviceHeight = y - serviceTop + 4;
          doc.rect(14, serviceTop - 6, pageWidth - 28, serviceHeight);

          y += 10;

          // --- PAGE BREAK CHECK ---
          if (y > pageHeight - 30) {
            doc.addPage();
            addHeader();
            // restart category heading at same position
            y = 40;
            const newCatTop = y;
            doc.setFontSize(14);
            doc.setFont('helvetica', 'normal');
            doc.text(`Category: ${category}`, 18, y + 8);
            y += 20;
            doc.rect(14, newCatTop, pageWidth - 28, (y - newCatTop) - boxPadding);
          }
        });
    });

    doc.save('services_report.pdf');
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
