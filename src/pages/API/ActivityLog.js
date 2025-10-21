import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { BASE_URL } from '../../config';

export function useActivityLogs() {
  const [logs, setLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const token = localStorage.getItem('adminToken');
  const adminId = localStorage.getItem('adminId');

  // Fetch logs
    const fetchLogs = useCallback(async () => {
      setIsLoading(true);
      try {
        const response = await axios.get(`${BASE_URL}/api/website/activity_logs`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setLogs(response.data.records || []);
      } catch (err) {
        console.error('Error fetching activity logs:', err);
        setError(err.response?.data?.message || err.message);
      } finally {
        setIsLoading(false);
      }
    }, [token]);

  // Delete log
  const handleDelete = async (logId) => {
    try {
      await axios.delete(`${BASE_URL}/api/website/activity_logs/${logId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchLogs(); // Refresh after deletion
    } catch (err) {
      console.error('Error deleting log:', err);
    }
  };

  // Undo log
  const handleUndo = async (logId) => {
    try {
      await axios.post(
        `${BASE_URL}/api/activity_logs/undo/${logId}`,
        { admin_id: adminId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchLogs(); // Refresh after undo
    } catch (err) {
      console.error('Error undoing log:', err);
    }
  };

  // Fetch logs on first render
    useEffect(() => {
      fetchLogs();
    }, [fetchLogs]);

  return { logs, isLoading, error, fetchLogs, handleDelete, handleUndo };
}

// import React from 'react';
// import { useActivityLogs } from './api/activityLogs';

// function ActivityLogPage() {
//   const { logs, isLoading, error, handleDelete, handleUndo } = useActivityLogs();

//   if (isLoading) return <p>Loading...</p>;
//   if (error) return <p>Error: {error}</p>;

//   return (
//     <div>
//       {logs.map((log) => (
//         <div key={log.id}>
//           <p>{log.description}</p>
//           <button onClick={() => handleUndo(log.id)}>Undo</button>
//           <button onClick={() => handleDelete(log.id)}>Delete</button>
//         </div>
//       ))}
//     </div>
//   );
// }

// export default ActivityLogPage;
