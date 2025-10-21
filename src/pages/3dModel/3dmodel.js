import { BASE_URL } from '../../config';
import React, { useState, useEffect } from 'react';
import BeforeModelModal from './BeforeModelModal';
import AfterModelModal from './AfterModelModal';
import '../../design/users.css';
const ThreeDModelManager = () => {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedPatient, setExpandedPatient] = useState(null);
  const [showModelModal, setShowModelModal] = useState(false);
  const [modelType, setModelType] = useState('');
 // const [selectedModelUrl, setSelectedModelUrl] = useState('');
const [selectedIdRecord, setSelectedIdRecord] = useState('');

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

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString(undefined, {
      year: 'numeric', month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

const handleViewModel = (type, url, idrecord) => { 
  const recordIdStr = String(idrecord);

  setModelType(type);
  //setSelectedModelUrl(url);
  setSelectedIdRecord(recordIdStr);
  setShowModelModal(true);
};




  return (
    <div className="container mt-4">
      <h2 className="mb-3">3D Model Management</h2>

      {isLoading ? (
        <div>Loading...</div>
      ) : (
        <table className="table table-bordered">

          <thead>
            <tr><th>Patient Name</th></tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr><td>No patients found</td></tr>
            ) : (
              data.map(({ patientKey, patientName, appointments }) => (
                <React.Fragment key={patientKey}>
                  <tr
                    onClick={() => toggleExpanded(patientKey)}
                    style={{ cursor: 'pointer', backgroundColor: expandedPatient === patientKey ? '#f1f1f1' : '' }}
                  >
                    <td>{patientName}</td>
                  </tr>

                  {expandedPatient === patientKey && (
                    <tr>
                      <td>
                        <table className="table table-sm">
                          <thead>
                            <tr><th>Appointment Date</th><th>Actions</th></tr>
                          </thead>
                          <tbody>
                            {appointments.map((appt, idx) => (
                              <tr key={idx}>
                                <td>{formatDate(appt.appointmentDate)}</td>
                                <td>
                                  <button
  className="btn btn-primary btn-sm me-2"
  onClick={(e) => {
    e.stopPropagation();
      const idrecord = String(appt.idrecord); // ✅ convert to string

      console.log("Record ID:", idrecord, "Type:", typeof idrecord); // ✅ print ID and type

    handleViewModel('Before', appt.beforeModelUrl, idrecord);
  }}
>
  Before
</button>

                                 <button
  className="btn btn-secondary btn-sm"
  onClick={(e) => {
    e.stopPropagation();
      console.log("Record ID:", appt.idrecord, "Type:", typeof appt.idrecord); // ✅ print ID and type
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
              ))
            )}
          </tbody>
        </table>
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
