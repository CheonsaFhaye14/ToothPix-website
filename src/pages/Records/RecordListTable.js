import React from 'react';
import RecordReportExport from './RecordReportExport';

export default function RecordListTable({
  searchTerm,
  setSearchTerm,
  groupBy,
  setGroupBy,
  sortKey,
  setSortKey,
  sortDirection,
  setSortDirection,
  sortedList,
  records,
  expandedPatient,
  toggleExpanded,
  openAppointmentModal,
  setEditFormData,
  setIsEditing,
  handleDelete,
  formatAppointmentDate
}) {
  return (
    <>
      <div className="filter-controls">
        <input
          type="text"
          className="form-control search-input search-margin-top"
          placeholder={`Search ${groupBy === 'patient' ? 'patient' : 'dentist'} name...`}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        <select
          className="form-select sort-select"
          value={groupBy}
          onChange={(e) => setGroupBy(e.target.value)}
        >
          <option value="patient">Group by Patient</option>
          <option value="dentist">Group by Dentist</option>
        </select>

        <select
          className="form-select sort-select"
          value={sortKey}
          onChange={(e) => setSortKey(e.target.value)}
        >
          <option value="">Sort By</option>
          <option value="name">Name</option>
          <option value="date">Appointment Date</option>
        </select>

        <select
          className="form-select sort-direction"
          value={sortDirection}
          onChange={(e) => setSortDirection(e.target.value)}
        >
          <option value="asc">Asc</option>
          <option value="desc">Desc</option>
        </select>
      </div>

      <table className="table table-bordered users-table">
        <thead>
          <tr>
<th>
  <div className="d-flex align-items-center w-100" style={{ justifyContent: 'flex-end' }}>
    <span style={{ marginRight: 'auto', marginBottom: '10px', paddingLeft: '430px' }}>
      {groupBy === 'patient' ? 'Patient Name' : 'Dentist Name'}
    </span>
    <RecordReportExport records={records} />
  </div>
</th>



          </tr>
        </thead>
        <tbody>
          
          {sortedList.length === 0 ? (
            <tr>
              <td className="text-center">No records found</td>
            </tr>
          ) : (
          sortedList.map((nameKey) => {
  const displayName = records.find(rec => {
    const name = groupBy === 'patient' ? rec?.patient_name : rec?.dentist_name;
    return name?.toLowerCase() === nameKey;
  })?.[groupBy === 'patient' ? 'patient_name' : 'dentist_name'] || 'Unknown';

  const isExpanded = expandedPatient === nameKey;
  const now = new Date();

  let appointments = records.filter((rec) => {
    const matchName = groupBy === 'patient' ? rec?.patient_name : rec?.dentist_name;
    if (!matchName || matchName.toLowerCase() !== nameKey) return false;

    const apptDate = new Date(rec.date);
    if (isNaN(apptDate)) return false;

    rec._parsedDate = apptDate;
    return apptDate < now;
  });
              appointments.sort((a, b) => {
                if (sortKey === 'name') {
                  const nameA = groupBy === 'patient' ? a.dentist_name : a.patient_name;
                  const nameB = groupBy === 'patient' ? b.dentist_name : b.patient_name;
                  return sortDirection === 'asc'
                    ? nameA.localeCompare(nameB)
                    : nameB.localeCompare(nameA);
                } else if (sortKey === 'date') {
                  return sortDirection === 'asc'
                    ? a._parsedDate - b._parsedDate
                    : b._parsedDate - a._parsedDate;
                }
                return 0;
              });

              return (
                <React.Fragment key={nameKey}>
                  <tr
                    onClick={() => toggleExpanded(nameKey)}
                    className={`group-row ${isExpanded ? 'active-group' : ''}`}
                  >
                    <td>{displayName}</td>
                  </tr>

                  {isExpanded && (
                    <tr>
                      <td colSpan="1">
                        <table className="table table-sm expanded-inner-table">
                          <thead>
                            <tr>
                              <th style={{ verticalAlign: 'top', paddingTop: '25px' }}>Appointment Date</th>
                              {groupBy === 'patient' ? <th style={{ verticalAlign: 'top', paddingTop: '25px' }}>Dentist Name</th> : <th style={{ verticalAlign: 'top', paddingTop: '25px' }}>Patient Name</th>}
                              <th>               
<RecordReportExport records={appointments} style={{ marginTop: '50px' }} />

</th>
                            </tr>
                          </thead>
                          <tbody>
                            {appointments.length === 0 ? (
                              <tr>
                                <td colSpan="3" className="text-center">No Record</td>
                              </tr>
                            ) : (
                              appointments.map((appt) => {
                                const rawDate = new Date(appt.date);
                                const localDateStr = `${rawDate.getFullYear()}-${(rawDate.getMonth() + 1).toString().padStart(2, '0')}-${rawDate.getDate().toString().padStart(2, '0')}`;

                                const formatTime12Hour = (dateObj) => {
                                  let hours = dateObj.getHours();
                                  const minutes = dateObj.getMinutes().toString().padStart(2, '0');
                                  const ampm = hours >= 12 ? 'PM' : 'AM';
                                  hours = hours % 12 || 12;
                                  const hoursStr = hours.toString().padStart(2, '0');
                                  return `${hoursStr}:${minutes} ${ampm}`;
                                };

                                return (
                                  <tr
                                    key={appt.idappointment}
                                    onClick={() => openAppointmentModal(appt)}
                                    style={{ cursor: 'pointer' }}
                                  >
                                    <td>{formatAppointmentDate(appt.date)}</td>
                                    <td>{groupBy === 'patient' ? appt.dentist_name : appt.patient_name}</td>
                                    <td onClick={(e) => e.stopPropagation()}>
                                      <button
                                        className="btn-edit me-2"
                                        onClick={() => {
                                           const editData = {
                                            idappointment: appt.idappointment,
                                            patient: appt.patient_name,
                                            dentist: appt.dentist_name,
                                            date: localDateStr,
                                            time: formatTime12Hour(rawDate),
                                            // store names (strings) so modal/inputs can render safely
                                            service: Array.isArray(appt.services)
                                              ? appt.services.map(s => typeof s === 'string' ? s : (s.name ?? String(s.idservice)))
                                              : (typeof appt.services === 'string'
                                                  ? appt.services.split(',').map(s => s.trim())
                                                  : []),
                                            serviceInput: '',
                                            treatment_notes: appt.treatment_notes || '',
                                          };
                                          setEditFormData(editData);
                                          setIsEditing(true);
                                          console.log('EditFormData', editData);
                                        }}
                                      >
                                        ✏️ Edit
                                      </button>
                                      <button
                                        className="btn-delete"
                                        onClick={() => handleDelete(appt.idappointment)}
                                      >
                                        🗑️ Delete
                                      </button>
                                    </td>
                                  </tr>
                                );
                              })
                            )}
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
    </>
  );
}
