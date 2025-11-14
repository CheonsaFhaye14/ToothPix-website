import './Table.css';

const CommonTable = ({
  columns = [],
  data = [],
  onEdit,
  onDelete,
  onUndo,
  editable = false,
  emptyMessage = "No records found",
}) => {
  const hasActions = onEdit || onDelete || onUndo;

  return (
    <div className="table-responsive">
      <table className="table table-bordered">
        <thead className="table-light">
          <tr>
            {columns.map((col) => (
              <th key={col.key}>{col.label}</th>
            ))}
            {hasActions && <th>Actions</th>}
          </tr>
        </thead>

        <tbody>
          {data.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length + (hasActions ? 1 : 0)}
                className="text-center py-3"
              >
                {typeof emptyMessage === "string" ? (
                  <span>{emptyMessage}</span>
                ) : (
                  emptyMessage
                )}
              </td>
            </tr>
          ) : (
            data.map((row, rowIndex) => (
              <tr key={row.id || rowIndex}>
                {columns.map((col) => (
                  <td key={col.key}>
                    {editable && col.editable ? (
                      <input
                        type={col.type || "text"}
                        value={row[col.key] || ""}
                        onChange={(e) =>
                          col.onChange && col.onChange(e.target.value, row)
                        }
                        className="form-control"
                      />
                    ) : col.render ? (
                      col.render(row[col.key], row)
                    ) : (
                      row[col.key]
                    )}
                  </td>
                ))}

                {hasActions && (
                  <td className="text-center">
                    <div className="d-flex justify-content-center gap-1">
                      {/* ✅ Only show Undo if log is not undone and not an UNDO action */}
                      {onUndo && row.action !== 'UNDO' && !row.is_undone && (
                        <button
                          className="btn-edit btn-sm"
                          onClick={() => onUndo(row.id)}
                        >
                          ↩️ Undo
                        </button>
                      )}

                      {onEdit && (
                        <button
                          className="btn-edit btn-sm"
                            onClick={() => onEdit(row)}
                          >
                            ✏️ Edit
                          </button>
                      )}

                      {onDelete && (
                        <button
                          className="btn-delete btn-sm"
                       onClick={() => onDelete(row.id ?? row.idservice)}
                        >
                          🗑️ Delete
                        </button>
                      )}
                    </div>
                  </td>
                )}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default CommonTable;
