import React, { useState } from "react"; 
import Table from "../../Components/Table/Table";
import { useActivityLogs } from "../../Hooks/ActivityLogs";
import { formatDateTime } from '../../utils/formatDateTime.jsx';
import MessageModal from "../../Components/MessageModal/MessageModal.jsx";

function ActivityLog() {
  const {
    logs,
    isLoading,
    error,
    handleDelete,
    handleUndo
  } = useActivityLogs();

  // ✅ modal state
  const [showModal, setShowModal] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null); // "delete" or "undo"
  const [targetId, setTargetId] = useState(null);
const [message, setMessage] = useState("");
const [messageType, setMessageType] = useState("info"); // "success" or "error"

// ✅ compact table columns for readability
const columns = [
  { header: "Admin", accessor: "adminName" },
  { header: "Action", accessor: "adminaction" },
  { header: "Date", accessor: "created_at" },
];

const showInfoFields = {
  usertype: [
    { key: "adminName", label: "Admin" },
    { key: "adminaction", label: "Action Taken" },
    { key: "table_name", label: "Target Table" },
    { key: "record_id", label: "Record ID" },
    { key: "description", label: "Description" },
    { key: "created_at", label: "Date" },
  ]
};


const confirmExecution = async () => {
  try {
    if (confirmAction === "delete") {
      await handleDelete(targetId);
      setMessage("Log deleted successfully!");
      setMessageType("success");
    } else if (confirmAction === "undo") {
      await handleUndo(targetId);
      setMessage("Action undone successfully!");
      setMessageType("success");
    }
  } catch (err) {
    setMessage("Something went wrong. Please try again.");
    setMessageType("error");
  } finally {
    setShowModal(false);
    setTargetId(null);
    setConfirmAction(null);
  }
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
     // ✅ map logs into human‑friendly rows
<Table
  columns={columns}
data={logs.map(log => ({
  ...log,
  created_at: formatDateTime(log.created_at),
  adminaction:
    log.action === "ADD"
      ? log.table_name === "users"
        ? `Added ${log.usertype || "user"}`
        : `Added ${log.table_name}`
      : log.action === "DELETE" && log.table_name === "users"
        ? "User deactivated"
        : log.action === "DELETE"
          ? `Deleted ${log.table_name}`
          : log.action === "EDIT" || log.action === "UPDATE"
            ? `Edited ${log.table_name}`
            : log.action === "PAY"
              ? "Processed payment"
              : log.action === "UNDO"
                ? "Undo performed"
                : `${log.action} on ${log.table_name}`,
  onDelete: () => {
    setTargetId(log.id);
    setConfirmAction("delete");
    setShowModal(true);
  },
  // ✅ only attach Undo if allowed
  onUndo: (log.action !== "UNDO" && !log.is_undone)
    ? () => {
        setTargetId(log.id);
        setConfirmAction("undo");
        setShowModal(true);
      }
    : undefined
}))}

  showInfoFields={showInfoFields}
  fieldColumn="usertype"
  emptyMessage="No activity logs found."
/>
      )}

  {showModal && (
  <div className="modal-overlay">
    <div className="modal-box">
      <p>
        {confirmAction === "delete"
          ? "Are you sure you want to delete this log?"
          : "Are you sure you want to undo this action?"}
      </p>
      <div className="action-buttons" style={{ marginTop: "1rem" }}>
        <button className="btn-submit" onClick={confirmExecution}>Yes</button>
        <button
          className="btn-cancel"
          onClick={() => {
            setShowModal(false);
            setTargetId(null);
            setConfirmAction(null);
          }}
        >
          Cancel
        </button>
      </div>
    </div>
  </div>
)}

<MessageModal
  message={message}
  type={messageType}
  onClose={() => setMessage("")}
/>


    </div>
  );
}

export default ActivityLog;
