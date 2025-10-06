import React, { useState, useEffect } from 'react';
import axios from 'axios';

function ActivityLog() {
  const [logs, setLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  function fetchLogs() {
    const token = localStorage.getItem('adminToken');
    axios
      .get('https://toothpix-backend.onrender.com/api/website/activity_logs', {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        setLogs(response.data.records || []);
      })
      .catch((err) => {
        console.error('Error fetching activity logs:', err);
        setError(err.response?.data?.message || err.message);
      })
      .finally(() => setIsLoading(false));
  }

  useEffect(() => {
    fetchLogs();
  }, []);

  function handleDelete(logId) {
    const token = localStorage.getItem('adminToken');
    axios
      .delete(`https://toothpix-backend.onrender.com/api/website/activity_logs/${logId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then(() => fetchLogs())
      .catch((err) => console.error('Error deleting log:', err));
  }

  function handleUndo(logId) {
    const token = localStorage.getItem('adminToken');
    const adminId = localStorage.getItem('adminId'); // send admin ID from frontend or JWT
    axios
      .post(
        `https://toothpix-backend.onrender.com/api/activity_logs/undo/${logId}`,
        { admin_id: adminId },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      .then(() => fetchLogs())
      .catch((err) => console.error('Error undoing log:', err));
  }

  return (
    <div className="container py-4">
      <h2 className="mb-2">Activity Log</h2>

      {/* Info text */}
      <div className="alert alert-info">
        Logs are automatically deleted after 30 days. Actions that have already been undone or deleted cannot be undone.
      </div>

      {isLoading && <div className="text-center">Loading activity logs...</div>}
      {error && <div className="alert alert-danger">{error}</div>}

      {!isLoading && !error && (
        <div className="table-responsive">
          <table className="table table-bordered table-hover">
            <thead className="table-light">
              <tr>
                <th>ID</th>
                <th>Action</th>
                <th>Table</th>
                <th>Target ID</th>
                <th>Description</th>
                <th>Created At</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {logs.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center">
                    No activity logs found.
                  </td>
                </tr>
              ) : (
                logs.map((log) => {
                  const undoDisabled = log.action === 'UNDO' || log.is_deleted;

                  return (
                    <tr key={log.id}>
                      <td>{log.id}</td>
                      <td>{log.action}</td>
                      <td>{log.table_name}</td>
                      <td>{log.record_id}</td>
                      <td>{log.description}</td>
                      <td>{new Date(log.created_at).toLocaleString()}</td>
                      <td>
                        <button
                          className="btn btn-sm btn-warning me-2"
                          onClick={() => handleUndo(log.id)}
                          disabled={undoDisabled}
                          title={
                            undoDisabled
                              ? 'Cannot undo this action'
                              : 'Undo this action'
                          }
                        >
                          Undo
                        </button>
                        <button
                          className="btn btn-sm btn-danger"
                          onClick={() => handleDelete(log.id)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default ActivityLog;
