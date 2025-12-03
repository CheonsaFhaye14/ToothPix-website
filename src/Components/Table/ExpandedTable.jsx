import React, { useMemo, useState } from "react";
import "../Table/Table.css";
import FloatingInput from "../../utils/InputForm.jsx";
import ShowInfoModal from "../ShowInfoModal/ShowInfoModal.jsx";
import ActionButtons from "../../utils/ActionButton/ActionButtons.jsx";

const Table = ({
  columns = [],
  data = [],
  filters = {},
  setFilters,
  showInfoFields = {},
  fieldColumn,
  expandableKey, // key to group rows (e.g., patientKey)
  subRowsKey, // key for expanded rows (e.g., appointments)
  renderSubRow // function to render sub-row content
}) => {
  const [search, setSearch] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: "", direction: "" });
  const [currentPage, setCurrentPage] = useState(1);
  const [showAll, setShowAll] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);
  const [expandedRow, setExpandedRow] = useState(null);

  const rowsPerPage = 5;
  const hasActions = data.some(row => row.onEdit || row.onDelete || row.onUndo);

  const handleReset = () => {
    setSearch("");
    setSortConfig({ key: "", direction: "" });
    setCurrentPage(1);
    setShowAll(false);
    setFilters?.({});
  };

  const handleSort = (key) => {
    setCurrentPage(1);
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc"
    }));
  };

  const filteredData = useMemo(() => {
    return data.filter(row => {
      const searchMatch = Object.values(row)
        .join(" ")
        .toLowerCase()
        .includes(search.toLowerCase());

      const filtersMatch = Object.keys(filters).every(key => {
        const filterValue = filters[key];
        if (!filterValue) return true;
        const cellValue = row[key];
        const col = columns.find(c => c.accessor === key);
        return col?.filterFn
          ? col.filterFn(cellValue, filterValue, row)
          : String(cellValue)?.toLowerCase().includes(String(filterValue).toLowerCase());
      });

      return searchMatch && filtersMatch;
    });
  }, [data, search, filters, columns]);

  const sortedData = useMemo(() => {
    if (!sortConfig.key) return filteredData;

    const isDate = val => val && !isNaN(Date.parse(val));
    const isNumber = val => val !== null && val !== "" && !isNaN(Number(val));

    return [...filteredData].sort((a, b) => {
      let aVal = a[sortConfig.key];
      let bVal = b[sortConfig.key];

      if (typeof aVal === "string") aVal = aVal.trim();
      if (typeof bVal === "string") bVal = bVal.trim();

      if (isNumber(aVal) && isNumber(bVal)) {
        return sortConfig.direction === "asc"
          ? Number(aVal) - Number(bVal)
          : Number(bVal) - Number(aVal);
      }

      if (isDate(aVal) && isDate(bVal)) {
        return sortConfig.direction === "asc"
          ? new Date(aVal) - new Date(bVal)
          : new Date(bVal) - new Date(aVal);
      }

      return sortConfig.direction === "asc"
        ? String(aVal).localeCompare(String(bVal), undefined, { sensitivity: "base" })
        : String(bVal).localeCompare(String(aVal), undefined, { sensitivity: "base" });
    });
  }, [filteredData, sortConfig]);

  const totalPages = Math.ceil(sortedData.length / rowsPerPage);
  const paginatedData = showAll
    ? sortedData
    : sortedData.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

  const isResetDisabled =
    !search && !sortConfig.key && !showAll && (!filters || Object.values(filters).every(v => !v));

  const toggleExpanded = (key) => {
    setExpandedRow(prev => (prev === key ? null : key));
  };

  return (
    <div className="table-wrapper">
        <div className="one-row">
        <FloatingInput
          placeholder="Search..."
          value={search}
          onChange={e => { setSearch(e.target.value); setCurrentPage(1); }}
        />
        <button className="Showall-btn" onClick={() => setShowAll(prev => !prev)}>
          {showAll ? "Paginate" : "Show All"}
        </button>
        <button onClick={handleReset} disabled={isResetDisabled} className="reset-btn">
          Reset
        </button>
      </div>

      <table className="custom-table">
        <thead>
          <tr>
            {columns.map(col => (
              <th key={col.accessor} onClick={() => handleSort(col.accessor)} className="sortable">
                {col.header}
                {sortConfig.key === col.accessor && (sortConfig.direction === "asc" ? " ▲" : " ▼")}
              </th>
            ))}
            {hasActions && <th>Actions</th>}
          </tr>
        </thead>
        <tbody>
          {paginatedData.length > 0 ? (
            paginatedData.map((row, idx) => (
              <React.Fragment key={idx}>
                <tr
                  style={{ cursor: expandableKey ? "pointer" : "default", backgroundColor: expandedRow === row[expandableKey] ? "#f1f1f1" : "" }}
                  onClick={() => expandableKey && toggleExpanded(row[expandableKey])}
                >
                 {columns.map(col => (
  <td key={col.accessor}>
    {col.render ? col.render(row) : row[col.accessor]}
  </td>
))}

                  {hasActions && (
                    <td onClick={e => e.stopPropagation()}>
                      <ActionButtons
                        onEdit={row.onEdit}
                        onDelete={row.onDelete}
                        onUndo={row.onUndo}
                        editLabel={row.editLabel}
                        deleteLabel={row.deleteLabel}
                        undoLabel={row.undoLabel}
                      />
                    </td>
                  )}
                </tr>

              {expandableKey && expandedRow && (() => {
  const rowData = data.find(r => r[expandableKey] === expandedRow);
  if (!rowData) return null;

  let matchKey = null;
  if (fieldColumn && rowData[fieldColumn]) {
    const v = String(rowData[fieldColumn]).toLowerCase();
    if (showInfoFields[v]) matchKey = v;
  }
  if (!matchKey && fieldColumn) {
    const v = String(fieldColumn).toLowerCase();
    if (showInfoFields[v]) matchKey = v;
  }

  const fields = matchKey
    ? showInfoFields[matchKey].map(f => ({
        key: f.key,
        label: f.label,
        value: rowData[f.key] ?? ""
      }))
    : Object.keys(rowData).map(key => ({
        key,
        label: key,
        value: rowData[key]
      }));

  return <ShowInfoModal row={rowData} fields={fields} onClose={() => setExpandedRow(null)} />;
})()}

              </React.Fragment>
            ))
          ) : (
            <tr>
              <td colSpan={columns.length + (hasActions ? 1 : 0)} className="no-data">
                No data available
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {!showAll && (
        <div className="pagination">
          <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}>Prev</button>
          <span>Page {currentPage} of {totalPages || 1}</span>
          <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)}>Next</button>
        </div>
      )}

      {selectedRow && (
        <ShowInfoModal
          row={selectedRow}
          fields={(() => {
            let matchKey = null;

            if (fieldColumn && selectedRow[fieldColumn]) {
              const v = String(selectedRow[fieldColumn]).toLowerCase();
              if (showInfoFields[v]) matchKey = v;
            }
            if (!matchKey && fieldColumn) {
              const v = String(fieldColumn).toLowerCase();
              if (showInfoFields[v]) matchKey = v;
            }
            if (matchKey) {
              return showInfoFields[matchKey].map(f => ({
                key: f.key,
                label: f.label,
                value: selectedRow[f.key] ?? ""
              }));
            }
            return Object.keys(selectedRow).map(key => ({
              key,
              label: key,
              value: selectedRow[key]
            }));
          })()}
          onClose={() => setSelectedRow(null)}
        />
      )}
    </div>
  );
};

export default Table;
