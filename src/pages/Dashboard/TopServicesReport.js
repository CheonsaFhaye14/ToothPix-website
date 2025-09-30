import React, { useEffect, useState } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import Papa from 'papaparse';
import { Bar } from 'react-chartjs-2';
import 'chart.js/auto';

export default function TopServicesReport({ onClose }) {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTopServicesReport = async () => {
      try {
        const res = await fetch(
          'https://toothpix-backend.onrender.com/api/reports/top-services'
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
    const doc = new jsPDF('landscape');
    doc.text('Top Services Report', 14, 15);
    autoTable(doc, {
      head: [
        [
          'Service Name',
          'Usage Count',
          'Unique Appointments',
          'Unique Patients',
          'Total Revenue',
        ],
      ],
      body: services.map((s) => [
        s.service_name,
        s.usage_count,
        s.unique_appointments,
        s.unique_patients,
        Number(s.total_revenue).toFixed(2),
      ]),
    });
    doc.save('top_services_report.pdf');
  };

  const barData = {
    labels: services.slice(0, 10).map((s) => s.service_name),
    datasets: [
      {
        label: 'Usage Count',
        data: services.slice(0, 10).map((s) => s.usage_count),
        backgroundColor: '#6bb8fa',
      },
    ],
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
              <div className="mb-3" style={{ height: 350, width: 500 }}>
                <Bar
                  data={barData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: { display: false },
                      tooltip: { mode: 'index', intersect: false },
                    },
                  }}
                />
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
                marginBottom: '1rem',
              }}
            >
              {services.length > 0 && (
                <>
                  <button
                    className="btn btn-primary"
                    onClick={exportCSV}
                    style={{ minWidth: 120 }}
                  >
                    Download CSV
                  </button>

                  <button
                    className="btn btn-danger"
                    onClick={exportPDF}
                    style={{ minWidth: 120 }}
                  >
                    Download PDF
                  </button>
                </>
              )}

              <button
                className="btn btn-secondary"
                onClick={onClose}
                style={{ minWidth: 120 }}
              >
                Close
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
