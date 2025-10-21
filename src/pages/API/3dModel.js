import { BASE_URL } from '../../config';

/**
 * Fetches all 3D models from the backend.
 * Groups them by patient and sorts appointments by date.
 */
export async function fetch3DModels() {
  const res = await fetch(`${BASE_URL}/api/website/3dmodels`);

  if (!res.ok) {
    throw new Error(`Failed to fetch 3D models: ${res.status}`);
  }

  const json = await res.json();

  const grouped = json.models.reduce((acc, model) => {
    const patientKey = model.patient_name || 'Unknown Patient';
    if (!acc[patientKey]) {
      acc[patientKey] = { 
        patientKey, 
        patientName: patientKey, 
        appointments: [] 
      };
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

  // Sort appointments and patients alphabetically
  Object.values(grouped).forEach(patient => {
    patient.appointments.sort((a, b) => new Date(a.appointmentDate) - new Date(b.appointmentDate));
  });

  return Object.values(grouped).sort((a, b) => a.patientName.localeCompare(b.patientName));
}


// import { useEffect, useState } from 'react';
// import { fetch3DModels } from '../api/modelApi';

// function ModelViewer() {
//   const [data, setData] = useState([]);
//   const [isLoading, setIsLoading] = useState(false);

//   useEffect(() => {
//     async function loadModels() {
//       setIsLoading(true);
//       try {
//         const models = await fetch3DModels();
//         setData(models);
//       } catch (error) {
//         console.error('Error fetching 3D model data:', error);
//       }
//       setIsLoading(false);
//     }

//     loadModels();
//   }, []);

//   return (
//     <div>
//       {isLoading ? (
//         <p>Loading 3D models...</p>
//       ) : (
//         data.map(patient => (
//           <div key={patient.patientKey}>
//             <h3>{patient.patientName}</h3>
//             <ul>
//               {patient.appointments.map(appt => (
//                 <li key={appt.idrecord}>
//                   <p>{appt.appointmentDate}</p>
//                   <p>{appt.treatmentNotes}</p>
//                 </li>
//               ))}
//             </ul>
//           </div>
//         ))
//       )}
//     </div>
//   );
// }

// export default ModelViewer;
