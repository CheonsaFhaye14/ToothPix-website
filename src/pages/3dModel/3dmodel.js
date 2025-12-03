import { BASE_URL } from '../../config';
import React, { useState, useEffect } from 'react';
import BeforeModelModal from './BeforeModelModal';
import AfterModelModal from './AfterModelModal';
import FloatingInput from '../../utils/InputForm';
import { formatDateTime } from '../../utils/formatDateTime';

const ThreeDModelManager = () => {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedPatient, setExpandedPatient] = useState(null);
  const [showModelModal, setShowModelModal] = useState(false);
  const [modelType, setModelType] = useState('');
 // const [selectedModelUrl, setSelectedModelUrl] = useState('');
const [selectedIdRecord, setSelectedIdRecord] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showAll, setShowAll] = useState(false);
  const [sortKey, setSortKey] = useState(null);            // 'date' or other field
  const [sortDirection, setSortDirection] = useState('asc');


  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      try {
        const res = await fetch(`${BASE_URL}/api/website/3dmodels`);
        const json = await res.json();

        const grouped = json.models.reduce((acc, model) => {
          const patientKey = model.patient_name || 'Unknown Patient';
          if (!acc[patientKey]) {
            acc[patientKey] = { patientKey, patientName: patientKey, appointments: [] };
          }
          acc[patientKey].appointments.push({
            idrecord: model.idrecord,
            appointmentDate: model.appointment_date,
            beforeModelUrl: model.before_model_url,
            afterModelUrl: model.after_model_url,
            treatmentNotes: model.treatment_notes,
          });
          return acc;
        }, {});

        Object.values(grouped).forEach(patient => {
          patient.appointments.sort((a, b) => new Date(a.appointmentDate) - new Date(b.appointmentDate));
        });

        setData(Object.values(grouped).sort((a, b) => a.patientName.localeCompare(b.patientName)));
      } catch (error) {
        console.error('Error fetching 3D model data:', error);
      }
      setIsLoading(false);
    }

    fetchData();
  }, []);

  const toggleExpanded = (patientKey) => {
    setExpandedPatient(expandedPatient === patientKey ? null : patientKey);
  };
  // Example reset function
 const handleReset = () => {
    setSearchTerm('');
    setCurrentPage(1);
    setShowAll(false);
    setSortKey(null);
    setSortDirection('asc');
  };

const handleViewModel = (type, url, idrecord) => { 
  const recordIdStr = String(idrecord);

  setModelType(type);
  //setSelectedModelUrl(url);
  setSelectedIdRecord(recordIdStr);
  setShowModelModal(true);
};
const handleSort = (key) => {
  if (sortKey === key) {
    setSortDirection(sortDirection === "asc" ? "desc" : "asc");
  } else {
    setSortKey(key);
    setSortDirection("asc");
  }
};
let sortedData = [...data];
if (sortKey === "patient_name") {
  sortedData.sort((a, b) => {
    const nameA = a.patientName.toLowerCase();
    const nameB = b.patientName.toLowerCase();
    if (nameA < nameB) return sortDirection === "asc" ? -1 : 1;
    if (nameA > nameB) return sortDirection === "asc" ? 1 : -1;
    return 0;
  });
}
// Apply search filter
let filteredData = sortedData.filter(patient =>
  patient.patientName.toLowerCase().includes(searchTerm.toLowerCase())
);
const pageSize = 5; // number of patients per page

let paginatedData = filteredData;
if (!showAll) {
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  paginatedData = filteredData.slice(startIndex, endIndex);
}

const totalPages = Math.ceil(filteredData.length / pageSize);


const isResetDisabled = searchTerm === "" && !showAll && currentPage === 1;




  return (
    <div className="container mt-4">
      <h1>3D Model Management</h1>

      {isLoading ? (
        <div>Loading...</div>
      ) : (
         <> <div className="table-wrapper">
        <div className="filter-controls">
          <div className="one-row">
            <FloatingInput
              className="one-row-input"
              placeholder="Search by patient name..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1); // reset to first page when searching
              }}
            />
            <div className="buttons">
              <button
                className="Showall-btn"
                onClick={() => setShowAll((prev) => !prev)}
              >
                {showAll ? "Paginate" : "Show All"}
              </button>
    
              <button
                onClick={handleReset}
                disabled={isResetDisabled}
                className="reset-btn"
              >
                Reset
              </button>
            </div>
          </div>
        </div>
    
<table className="custom-table">
  <thead>
    <tr>
      <th onClick={() => handleSort("patient_name")}>
        Patient Name {sortKey === "patient_name" && (sortDirection === "asc" ? "▲" : "▼")}
      </th>
    </tr>
  </thead>
<tbody>
  {paginatedData.length === 0 ? (
    <tr><td>No patients found</td></tr>
  ) : (
    paginatedData.map(({ patientKey, patientName, appointments }) => {
      const isExpanded = expandedPatient === patientKey;

      // Sort appointments here
      let sortedAppointments = [...appointments];
      if (sortKey === "appointment_date") {
        sortedAppointments.sort((a, b) => {
          const dateA = new Date(a.appointmentDate);
          const dateB = new Date(b.appointmentDate);
          if (dateA < dateB) return sortDirection === "asc" ? -1 : 1;
          if (dateA > dateB) return sortDirection === "asc" ? 1 : -1;
          return 0;
        });
      }

      return (
        <React.Fragment key={patientKey}>
          <tr
            onClick={() => toggleExpanded(patientKey)}
style={{
  cursor: 'pointer',
  backgroundColor: isExpanded ? '#eef8fcff' : '',
  fontWeight: isExpanded ? 'bold' : 'normal'
}}

          >
            <td>{patientName}</td>
          </tr>

          {isExpanded && (
            <tr>
              <td>
                <table className="expanded-inner-table">
                  <thead>
                    <tr>
                      <th onClick={() => handleSort("appointment_date")}>
                        Appointment Date {sortKey === "appointment_date" && (sortDirection === "asc" ? "▲" : "▼")}
                      </th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedAppointments.map((appt, idx) => (
                      <tr key={idx}>
                        <td>{formatDateTime(appt.appointmentDate)}</td>
                        <td className="action-buttons">
                          <button
                            className="btn-edit"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleViewModel('Before', appt.beforeModelUrl, appt.idrecord);
                            }}
                          >
                            Before
                          </button>
                          <button
                            className="btn-edit"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleViewModel('After', appt.afterModelUrl, appt.idrecord);
                            }}
                          >
                            After
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </td>
            </tr>
          )}
        </React.Fragment>
      );
    })
  )}
</tbody>

</table>
{!showAll && (
  <div className="pagination">
    <button
      disabled={currentPage === 1}
      onClick={() => setCurrentPage(p => p - 1)}
    >
      Prev
    </button>
    <span>Page {currentPage} of {totalPages || 1}</span>
    <button
      disabled={currentPage === totalPages}
      onClick={() => setCurrentPage(p => p + 1)}
    >
      Next
    </button>
  </div>
)}

        </div>
        
</>
      )}

  {modelType === 'Before' && (
  <BeforeModelModal
    isOpen={showModelModal}
    onClose={() => setShowModelModal(false)}
    recordId={selectedIdRecord}  // ✅ pass the ID to the modal
  />
)}




      {showModelModal && modelType === 'After' && (
        <AfterModelModal onClose={() => setShowModelModal(false)} />
      )}
    </div>
  );
};

export default ThreeDModelManager;
