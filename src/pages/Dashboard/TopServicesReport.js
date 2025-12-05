import { useEffect, useState } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import Papa from 'papaparse';
import { Bar } from 'react-chartjs-2';
import 'chart.js/auto';
import { BASE_URL } from '../../config';
import formBackground from '../../assets/ServicesReport.png'; // ✅ import the background image

export default function TopServicesReport({ onClose }) {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTopServicesReport = async () => {
      try {
        const res = await fetch(
          `${BASE_URL}/api/reports/top-services`
        );
        if (!res.ok) throw new Error('Failed to fetch top services report');
        const data = await res.json();
        setServices(data.topServices || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTopServicesReport();
  }, []);

  const exportCSV = () => {
    if (!services.length) return;
    const csv = Papa.unparse(
      services.map((s) => ({
        'Service Name': s.service_name,
        'Usage Count': s.usage_count,
        'Unique Appointments': s.unique_appointments,
        'Unique Patients': s.unique_patients,
        'Total Revenue': s.total_revenue,
      }))
    );
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'top_services_report.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

const exportPDF = () => {
  if (!services.length) return;
  const doc = new jsPDF('landscape'); // ✅ landscape orientation

  const img = new Image();
  img.src = formBackground; // use imported image

  img.onload = () => {
    // Full-page background
    doc.addImage(
      img,
      'PNG',
      0,
      0,
      doc.internal.pageSize.getWidth(),
      doc.internal.pageSize.getHeight()
    );

    // Title
    doc.setFontSize(16);

    // Chart at the top
    const chartCanvas = document.querySelector('canvas');
    const chartImage = chartCanvas.toDataURL('image/png', 1.0);
doc.addImage(chartImage, 'PNG', 30, 30, 200, 95); // smaller chart for landscape

    // Table below chart
    autoTable(doc, {
      startY: 130, // start after chart
      head: [['Service Name','Usage Count','Unique Appointments','Unique Patients','Total Revenue']],
      body: services.map((s) => [
        s.service_name,
        s.usage_count,
        s.unique_appointments,
        s.unique_patients,
        Number(s.total_revenue).toFixed(2),
      ]),
      styles: { fillColor: [173, 216, 230] },
      alternateRowStyles: { fillColor: [240, 248, 255] },
    });

    doc.save('top_services_report.pdf');
  };

  img.onerror = () => {
    console.error('Failed to load background image');
  };
};



const barData = {
  labels: services.slice(0, 10).map((s) => s.service_name),
  datasets: [
    {
      label: 'Usage Count',
      data: services.slice(0, 10).map((s) => s.usage_count),
      backgroundColor: [
        'rgba(173, 216, 230, 0.8)', // light blue
        'rgba(135, 206, 250, 0.8)', // sky blue
        'rgba(100, 149, 237, 0.8)', // cornflower blue
        'rgba(70, 130, 180, 0.8)',  // steel blue
        'rgba(65, 105, 225, 0.8)',  // royal blue
        'rgba(30, 144, 255, 0.8)',  // dodger blue
        'rgba(0, 191, 255, 0.8)',   // deep sky blue
        'rgba(25, 25, 112, 0.8)',   // midnight blue
        'rgba(0, 0, 255, 0.8)',     // pure blue
        'rgba(0, 0, 139, 0.8)',     // dark blue
      ],
      borderRadius: 6, // rounded edges
      barThickness: 'flex', // let Chart.js auto adjust thickness
    },
  ],
};

const barOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: {
      mode: 'index',
      intersect: false,
      backgroundColor: '#4682b4',
      titleColor: '#fff',
      bodyColor: '#fff',
    },
  },
  scales: {
    x: {
      grid: { display: false },
      ticks: {
        color: '#4682b4',
        font: { size: 12, weight: 'bold' },
      },
    },
    y: {
      grid: { color: 'rgba(173, 216, 230, 0.2)' },
      ticks: {
        color: '#4682b4',
        font: { size: 12 },
      },
    },
  },
};



  return (
    <div className="modal-overlay">
      <div className="modal-box">
        <h2>Top Services Report</h2>

        {loading && <p>Loading...</p>}
        {error && <p className="text-danger">{error}</p>}

        {!loading && !error && (
          <>
            {services.length > 0 ? (
        <div className="mb-3" style={{ height: 250 }}>
  <Bar data={barData} options={barOptions} />
</div>

            ) : (
              <p
                style={{
                  textAlign: 'center',
                  margin: '1rem 0',
                  fontStyle: 'italic',
                }}
              >
                No service data available.
              </p>
            )}

            <div
              className="modal-actions"
              style={{
                display: 'flex',
                justifyContent: 'center',
                gap: '1rem',
                marginBottom: '5px'
              }}
            >
              {services.length > 0 && (
                <>
                  <button
                    className=" btn-csv"
                    onClick={exportCSV}
                    style={{ minWidth: 120 }}
                  >
                    Download CSV
                  </button>

                  <button
                    className=" btn-pdf"
                    onClick={exportPDF}
                    style={{ minWidth: 120 }}
                  >
                    Download PDF
                  </button>
                </>
              )}

             
            </div>
          </>
        )}
          <button className="btn-cancel" onClick={onClose}>
                Close
              </button>
      </div>
      </div>
  );
}
