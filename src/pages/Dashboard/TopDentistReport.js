import React, { useEffect, useState } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import Papa from 'papaparse';
import { Bar } from 'react-chartjs-2';
import 'chart.js/auto';
import { BASE_URL } from '../../config';

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

  // CSV Export
  const exportCSV = () => {
    if (!dentists.length) return;

    const csv = Papa.unparse(
      dentists.map((d) => ({
        'Dentist Name': d.fullname,
        'Patients Helped': d.patients_helped,
      }))
    );

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = 'top_dentists_report.csv';
    a.click();

    URL.revokeObjectURL(url);
  };

  // PDF Export
  const exportPDF = () => {
    if (!dentists.length) return;

    const doc = new jsPDF('portrait');
    doc.text('Top Dentists Report', 14, 15);

    autoTable(doc, {
      head: [['Dentist Name', 'Patients Helped']],
      body: dentists.map((d) => [d.fullname, d.patients_helped]),
    });

    doc.save('top_dentists_report.pdf');
  };

  // Chart Data
  const chartData = {
    labels: dentists.slice(0, 10).map((d) => d.fullname),
    datasets: [
      {
        label: 'Patients Helped',
        data: dentists.slice(0, 10).map((d) => d.patients_helped),
        backgroundColor: '#6bb8fa',
      },
    ],
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
              <>
                {/* Chart */}
                <div style={{ height: 300, marginBottom: '1rem' }}>
                  <Bar
                    data={chartData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: { legend: { display: false } },
                    }}
                  />
                </div>
              </>
            ) : (
              <p
                style={{
                  textAlign: 'center',
                  margin: '1rem 0',
                  fontStyle: 'italic',
                }}
              >
                No dentist data available.
              </p>
            )}

            {/* Actions */}
            <div
              className="modal-actions"
              style={{
                marginTop: '1.5rem',
                display: 'flex',
                justifyContent: 'center',
                gap: '1rem',
                flexWrap: 'wrap',
              }}
            >
              {dentists.length > 0 && (
                <>
                  <button className="btn btn-primary" onClick={exportCSV}>
                    Download CSV
                  </button>

                  <button className="btn btn-danger" onClick={exportPDF}>
                    Download PDF
                  </button>
                </>
              )}

              
            </div>
          </>
        )}
        <div className="modal-actions" style={{ marginTop: '1.5rem' }}> 
        <button className="btn btn-secondary" onClick={onClose}>
                Close
              </button>
      </div>
      </div>
    </div>
  );
}
