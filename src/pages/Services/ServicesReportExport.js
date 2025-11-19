import React from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { saveAs } from 'file-saver';
import Papa from 'papaparse';

export default function ServicesReportExport({ services }) {
  const handleDownloadCSV = () => {
    const sortedServices = [...services].sort((a, b) => a.idservice - b.idservice);
    const csv = Papa.unparse(sortedServices);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, 'services_report.csv');
  };

  const handleDownloadPDF = () => {
    const doc = new jsPDF({ orientation: 'landscape' });
    doc.setFontSize(14);
    doc.text('Services Report', 14, 15);

    const headers = [['ID', 'Name', 'Description', 'Price', 'Category']];
    const data = [...services]
      .sort((a, b) => a.idservice - b.idservice)
      .map(service => [
        service.idservice,
        service.name,
        service.description || '—',
        `PHP ${parseFloat(service.price).toFixed(2)}`,
        service.category || '—',
      ]);

    autoTable(doc, {
      startY: 20,
      head: headers,
      body: data,
      styles: { fontSize: 9 },
      headStyles: { fillColor: [41, 128, 185] },
    });

    doc.save('services_report.pdf');
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
