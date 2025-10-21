import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { BASE_URL } from '../../config';

export function useDashboard() {
  const [dashboardData, setDashboardData] = useState({});
  const [appointments, setAppointments] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('jwt_token');

      // Make all requests in parallel
      const [dashboardRes, todayAppointmentsRes, topServicesRes] = await Promise.all([
        axios.get(`${BASE_URL}/api/website/admindashboard`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${BASE_URL}/api/reports/today-appointments`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${BASE_URL}/api/reports/top-services`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      setDashboardData(dashboardRes.data || {});
      setAppointments(todayAppointmentsRes.data.appointmentsToday || []);
      setServices(topServicesRes.data.topServices || []);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError(err.response?.data?.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  return {
    dashboardData,
    appointments,
    services,
    loading,
    error,
    refetch: fetchDashboardData, // allows manual refresh if needed
  };
}
