import { useState, useEffect, useCallback } from 'react';
import {
  getActivityLogs,
  deleteActivityLog,
  undoActivityLog,
} from '../API/ActivityLog';

export function useActivityLogs() {
  const [logs, setLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchLogs = useCallback(async () => {
    const token = localStorage.getItem('adminToken');
    setIsLoading(true);
    try {
      const response = await getActivityLogs(token);
      setLogs(response.data.records || []);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleDelete = async (logId) => {
    const token = localStorage.getItem('adminToken');
    await deleteActivityLog(logId, token);
    fetchLogs();
  };

  const handleUndo = async (logId) => {
    const token = localStorage.getItem('adminToken');
    const adminId = localStorage.getItem('adminId');
    await undoActivityLog(logId, adminId, token);
    fetchLogs();
  };

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  return { logs, isLoading, error, fetchLogs, handleDelete, handleUndo };
}
