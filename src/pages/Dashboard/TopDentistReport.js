import React, { useEffect, useState } from 'react';
import { jsPDF } from 'jspdf';
import { Bar } from 'react-chartjs-2';
import 'chart.js/auto';
import { BASE_URL } from '../../config';
import formBackground from '../../assets/ServicesReport.png'; // ✅ import the background image

export default function TopDentistsReport({ onClose }) {
  const [dentists, setDentists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTopDentists = async () => {
      try {
        const res = await fetch(`${BASE_URL}/api/reports/top-dentists`);
        const data = await res.json();

        if (data.topDentists && data.topDentists.length > 0) {
          setDentists(
            data.topDentists.sort((a, b) => b.patients_helped - a.patients_helped)
          );
          setError(null);
        } else if (data.message) {
          setDentists([]);
          setError(data.message);
        } else {
          setDentists([]);
          setError(null);
        }
      } catch (err) {
        setError('Failed to fetch top dentists');
        setDentists([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTopDentists();
  }, []);

  // PDF Export (chart + background only)
  const exportPDF = () => {
    if (!dentists.length) return;

    const doc = new jsPDF('landscape');
    const img = new Image();
    img.src = formBackground;

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

      // Chart
      const chartCanvas = document.querySelector('canvas');
      const chartImage = chartCanvas.toDataURL('image/png', 1.0);
      doc.addImage(chartImage, 'PNG',  50, 50, 200, 105); // smaller chart for landscape

      doc.save('top_dentists_report.pdf');
    };
  };

  // Chart Data with improved design
  const chartData = {
    labels: dentists.slice(0, 10).map((d) => d.fullname),
    datasets: [
      {
        label: 'Patients Helped',
        data: dentists.slice(0, 10).map((d) => d.patients_helped),
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
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#4682b4',
        titleColor: '#fff',
        bodyColor: '#fff',
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: '#4682b4', font: { size: 12, weight: 'bold' } },
      },
      y: {
        grid: { color: 'rgba(173, 216, 230, 0.2)' },
        ticks: { color: '#4682b4', font: { size: 12 } },
      },
    },
  };

  return (
    <div className="modal-overlay">
      <div className="modal-box">
        <h2 style={{ textAlign: 'center', marginBottom: '1rem' }}>
          Top Dentists Report
        </h2>

        {loading && <p>Loading...</p>}
        {error && <p className="text-danger">{error}</p>}

        {!loading && !error && (
          <>
            {dentists.length > 0 ? (
              <div style={{ height: 250}}>
                <Bar data={chartData} options={chartOptions} />
              </div>
            ) : (
              <p style={{ textAlign: 'center', margin: '1rem 0', fontStyle: 'italic' }}>
                No dentist data available.
              </p>
            )}

            {dentists.length > 0 && (
              <div
                className="modal-actions"
                style={{
                  marginTop: '1.5rem',
                  display: 'flex',
                  justifyContent: 'center',
                  flexWrap: 'wrap',
                  marginBottom: '8px'
                }}
              >
                <button className="btn-pdf" onClick={exportPDF}>
                  Download PDF
                </button>
              </div>
            )}
          </>
        )}

          <button className="btn-cancel" onClick={onClose}>
            Close
          </button>
   
      </div>
    </div>
  );
}
