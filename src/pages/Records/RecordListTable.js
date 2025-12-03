import React, { useState } from 'react';
import RecordReportExport from './RecordReportExport';
import FloatingInput from '../../utils/InputForm.jsx';
import CustomSelect from '../../utils/Select/CustomSelect.jsx';
import  '../../utils/ActionButton/ActionButtons.css';
import ShowInfoModal from '../../Components/ShowInfoModal/ShowInfoModal.jsx';
import { formatDateTime } from '../../utils/formatDateTime.jsx';

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
  // 🔹 Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 5;
  const [showAll, setShowAll] = useState(false);
// inside your component
const [innerSortKey, setInnerSortKey] = useState("");
const [innerSortDirection, setInnerSortDirection] = useState("asc");
const [selectedRecord, setSelectedRecord] = useState(null);

// helper to sort appointments
const sortAppointments = (list) => {
  return [...list].sort((a, b) => {
    if (innerSortKey === "date") {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      return innerSortDirection === "asc" ? dateA - dateB : dateB - dateA;
    }
    if (innerSortKey === "name") {
      const nameA = groupBy === "patient" ? a.dentist_name : a.patient_name;
      const nameB = groupBy === "patient" ? b.dentist_name : b.patient_name;
      return innerSortDirection === "asc"
        ? nameA.localeCompare(nameB)
        : nameB.localeCompare(nameA);
    }
    return 0;
  });
};

  // 🔹 Reset button logic
  const handleReset = () => {
    setSearchTerm("");
    setCurrentPage(1);
    setShowAll(false);
  };
const groupedRecords = records.reduce((acc, rec) => {
  const key = groupBy === "patient" ? rec.patient_name : rec.dentist_name;

  console.log("record:", rec);
  console.log("generated key:", key);

  if (!key) return acc;
  const normalized = key.trim().toLowerCase();

  console.log("normalized key:", normalized);

  if (!acc[normalized]) acc[normalized] = [];
  acc[normalized].push(rec);
  return acc;
}, {});

const sortedKeys = Object.keys(groupedRecords).sort((a, b) => {
  if (sortKey === "name") {
    return sortDirection === "asc" ? a.localeCompare(b) : b.localeCompare(a);
  }
  if (sortKey === "date") {
    const dateA = new Date(groupedRecords[a][0]?.date);
    const dateB = new Date(groupedRecords[b][0]?.date);
    return sortDirection === "asc" ? dateA - dateB : dateB - dateA;
  }
  return 0;
});
const totalPages = Math.ceil(sortedKeys.length / rowsPerPage);
const paginatedKeys = showAll
  ? sortedKeys
  : sortedKeys.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

  const isResetDisabled = !searchTerm && !sortKey && sortDirection === "asc" && !showAll;

  return (
    <div className="table-wrapper">
      <div className="filter-controls">
     <div className="one-row">
  <FloatingInput
    className="one-row-input"
    placeholder={`Search ${groupBy === 'patient' ? 'patient' : 'dentist'} name...`}
    value={searchTerm}
    onChange={(e) => {
      setSearchTerm(e.target.value);
      setCurrentPage(1); // reset to first page when searching
    }}
  />

<CustomSelect
  name="groupBy"
  placeholder="Group by"
  options={[
    { label: "Patient", value: "patient" },
    { label: "Dentist", value: "dentist" }
  ]}
  value={groupBy}
  onChange={(e) => setGroupBy(e.target.value)}
/>

  <div className="buttons">
    <button className="Showall-btn" onClick={() => setShowAll(prev => !prev)}>
      {showAll ? "Paginate" : "Show All"}
    </button>

    <button onClick={handleReset} disabled={isResetDisabled} className="reset-btn">
      Reset
    </button>
  </div>
</div>



      </div>
<table className="custom-table">
  <thead>
    <tr>
      <th
        className="sortable"
        onClick={() => {
          if (sortKey === "name") {
            setSortDirection(sortDirection === "asc" ? "desc" : "asc");
          } else {
            setSortKey("name");
            setSortDirection("asc");
          }
        }}
      >
        <div
          className="d-flex align-items-center justify-content-between w-100"
          style={{ whiteSpace: "nowrap" }}
        >
          <span className="fw-semibold">
            {groupBy === "patient" ? "Patient Name" : "Dentist Name"}
            {sortKey === "name" && (sortDirection === "asc" ? " ▲" : " ▼")}
          </span>
          <div>
            <RecordReportExport records={records} />
          </div>
        </div>
      </th>
    </tr>
  </thead>

<tbody>
  {paginatedKeys.length === 0 ? (
    <tr>
      <td className="text-center">No records found</td>
    </tr>
  ) : (
    paginatedKeys.map((nameKey) => {
      const recordsForGroup = groupedRecords[nameKey];
      const displayName =
        groupBy === "patient"
          ? recordsForGroup[0]?.patient_name
          : recordsForGroup[0]?.dentist_name;

      const isExpanded = expandedPatient === nameKey;

      return (
        <React.Fragment key={nameKey}>
          <tr
            onClick={() => toggleExpanded(nameKey)}
            className={`group-row ${isExpanded ? "active-group" : ""}`}
          >
            <td>{displayName}</td>
          </tr>

          {isExpanded && (
            <tr>
              <td colSpan={1}>
                <table className="expanded-inner-table">
                  <thead>
                    <tr>
                      <th
                        className="sortable"
                        onClick={() => {
                          if (innerSortKey === "date") {
                            setInnerSortDirection(
                              innerSortDirection === "asc" ? "desc" : "asc"
                            );
                          } else {
                            setInnerSortKey("date");
                            setInnerSortDirection("asc");
                          }
                        }}
                      >
                        Appointment Date
                        {innerSortKey === "date" &&
                          (innerSortDirection === "asc" ? " ▲" : " ▼")}
                      </th>
                      <th
                        className="sortable"
                        onClick={() => {
                          if (innerSortKey === "name") {
                            setInnerSortDirection(
                              innerSortDirection === "asc" ? "desc" : "asc"
                            );
                          } else {
                            setInnerSortKey("name");
                            setInnerSortDirection("asc");
                          }
                        }}
                      >
                        {groupBy === "patient" ? "Dentist Name" : "Patient Name"}
                        {innerSortKey === "name" &&
                          (innerSortDirection === "asc" ? " ▲" : " ▼")}
                      </th>
                      <th>
                        <div className="d-flex justify-content-between">
                          <span className="fw-semibold">Actions</span>
                          <RecordReportExport records={recordsForGroup} />
                        </div>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {recordsForGroup.length === 0 ? (
                      <tr>
                        <td colSpan="3" className="text-center">
                          No Record
                        </td>
                      </tr>
                    ) : (
                      sortAppointments(recordsForGroup).map((appt) => (
                        <tr
                          key={appt.idappointment}
                          onClick={() => setSelectedRecord(appt)}
                          style={{ cursor: "pointer" }}
                        >
                          <td>{formatDateTime(appt.date)}</td>
                          <td>
                            {groupBy === "patient"
                              ? appt.dentist_name
                              : appt.patient_name}
                          </td>
                          <td onClick={(e) => e.stopPropagation()}>
                            <div className="action-buttons">
                              <button
                                className="btn-edit"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  const editData = { /* ... */ };
                                  setEditFormData(editData);
                                  setIsEditing(true);
                                }}
                              >
                                ✏️ Edit
                              </button>
                              <button
                                className="btn-delete"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDelete(appt.idappointment);
                                }}
                              >
                                🗑️ Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
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

      {/* 🔹 Pagination controls */}
      {!showAll && sortedList.length > 0 && (
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
      {selectedRecord && (
  <ShowInfoModal
    row={selectedRecord}
    onClose={() => setSelectedRecord(null)}
    fields={[
      { key: "patient_name", label: "Patient Name" },
      { key: "dentist_name", label: "Dentist Name" },
      { key: "date", label: "Appointment Date" },   // 👈 keep raw key
      { key: "notes", label: "Notes" },
    ]}
  />
)}
    </div>
    
  );
  
}
