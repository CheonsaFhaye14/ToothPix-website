import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { BASE_URL } from '../../config';

export function useRecords() {
  const [records, setRecords] = useState([]);
  const [report, setReport] = useState([]);
  const [patients, setPatients] = useState([]);
  const [dentists, setDentists] = useState([]);
  const [services, setServices] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const token = localStorage.getItem('jwt_token');

  // Fetch all records
  const fetchRecords = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await axios.get(`${BASE_URL}/api/website/record`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRecords(res.data.records || []);
    } catch (err) {
      console.error('Error fetching records:', err);
      setError(err.response?.data?.message || err.message);
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  // Fetch record report
  const fetchReport = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await axios.get(`${BASE_URL}/api/reports/records`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setReport(res.data.records || []);
    } catch (err) {
      console.error('Error fetching record report:', err);
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  // Fetch patients, dentists, and services
  const fetchPatients = useCallback(async () => {
    try {
      const res = await axios.get(`${BASE_URL}/api/app/patients`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPatients(res.data.patients || []);
    } catch (err) {
      console.error('Error fetching patients:', err);
    }
  }, [token]);

  const fetchDentists = useCallback(async () => {
    try {
      const res = await axios.get(`${BASE_URL}/api/app/dentists`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDentists(res.data.dentists || []);
    } catch (err) {
      console.error('Error fetching dentists:', err);
    }
  }, [token]);

  const fetchServices = useCallback(async () => {
    try {
      const res = await axios.get(`${BASE_URL}/api/app/services`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setServices(res.data.services || []);
    } catch (err) {
      console.error('Error fetching services:', err);
    }
  }, [token]);

  // Create a new record
  const createRecord = useCallback(
    async (newRecord) => {
      try {
        const res = await axios.post(`${BASE_URL}/api/website/record`, newRecord, {
          headers: { Authorization: `Bearer ${token}` },
        });
        fetchRecords();
        fetchReport();
        return res.data;
      } catch (err) {
        console.error('Error creating record:', err);
        setError(err.response?.data?.message || err.message);
      }
    },
    [token, fetchRecords, fetchReport]
  );

  // Update an existing record
  const updateRecord = useCallback(
    async (id, payload) => {
      try {
        const res = await axios.put(`${BASE_URL}/api/website/record/${id}`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
        fetchRecords();
        fetchReport();
        return res.data;
      } catch (err) {
        console.error('Error updating record:', err);
        setError(err.response?.data?.message || err.message);
      }
    },
    [token, fetchRecords, fetchReport]
  );

  // Delete a record
  const deleteRecord = useCallback(
    async (id) => {
      try {
        await axios.delete(`${BASE_URL}/api/website/record/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        fetchRecords();
        fetchReport();
      } catch (err) {
        console.error('Error deleting record:', err);
        setError(err.response?.data?.message || err.message);
      }
    },
    [token, fetchRecords, fetchReport]
  );

  useEffect(() => {
    fetchRecords();
    fetchReport();
    fetchPatients();
    fetchDentists();
    fetchServices();
  }, [fetchRecords, fetchReport, fetchPatients, fetchDentists, fetchServices]);

  return {
    records,
    report,
    patients,
    dentists,
    services,
    isLoading,
    error,
    fetchRecords,
    fetchReport,
    createRecord,
    updateRecord,
    deleteRecord,
  };
}
