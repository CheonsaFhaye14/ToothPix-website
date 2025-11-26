import React from "react"; 
import Table from "../../Components/Table/Table";
import { useActivityLogs } from "../../Hooks/ActivityLogs";
import { formatDateTime } from '../../utils/formatDateTime.jsx';

function ActivityLog() {
  const {
    logs,
    isLoading,
    error,
    handleDelete,
    handleUndo
  } = useActivityLogs();

  // Table columns
  const columns = [
    { header: "Admin Name", accessor: "adminName" },
    { header: "Action", accessor: "adminaction" },
    { header: "Date", accessor: "created_at" },
  ];

  // Show-only modal fields
  const showInfoFields = {
    usertype: [
      { key: "adminName", label: "Admin Name" },
      { key: "adminaction", label: "Action" },
      { key: "created_at", label: "Date" }
    ]
  };

  return (
    <div className="container py-4">
      <h1>Activity Log</h1>

      <div className="alert alert-info">
        Logs are automatically deleted after 30 days. Actions that have already been undone or deleted cannot be undone.
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {isLoading ? (
        <div className="loading-text">Loading...</div>
      ) : (
        <Table
          columns={columns}
          data={logs.map(log => ({
            ...log,
            created_at: formatDateTime(log.created_at),
            adminaction:
              log.action === "ADD"
                ? log.table_name === "users"
                  ? "Created new user"
                  : `Created new ${log.table_name}`
              : log.action === "DELETE" && log.table_name === "users"
                ? "Deactivated a user"
              : `${log.action} - ${log.table_name}` // Other actions
          }))}
          showInfoFields={showInfoFields}
          fieldColumn="usertype"
          onDelete={handleDelete}
          onUndo={(id) => {
            const log = logs.find((l) => l.id === id);
            if (log && log.action !== "UNDO" && !log.is_undone) {
              handleUndo(id);
            }
          }}
          emptyMessage="No activity logs found."
        />
      )}
    </div>
  );
}

export default ActivityLog;
