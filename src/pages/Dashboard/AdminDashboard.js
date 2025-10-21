import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../../design/dashboard.css';
import { BASE_URL } from '../../config';

import AppointmentTodayCard from './AppointmentTodayCard';
import EarningsCard from './EarningsCard';
import TopServices from './TopServices';
import TopDentists from './TopDentists';
import GraphSales from './GraphSales';
import TopServicesReport from './TopServicesReport';
import TodayAppointmentsReport from './TodayAppointmentsReport'; // Import modal for today's appointments

export default function AdminDashboard() {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showTopServicesReport, setShowTopServicesReport] = useState(false);
  const [showTodayAppointmentsReport, setShowTodayAppointmentsReport] = useState(false); // new state

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/api/website/admindashboard`);
        setDashboardData(response.data);
      } catch (err) {
        setError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) return <div>Loading dashboard...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="dashboard container">
      <h2>Overview</h2>
      <div className="row gy-4 gx-2">
        {/* Pass onClick handler to AppointmentTodayCard */}
        <AppointmentTodayCard
          count={dashboardData.totalAppointmentsToday}
          onClick={() => setShowTodayAppointmentsReport(true)}
        />
        <EarningsCard earnings={dashboardData.thisMonthEarnings} />
        <GraphSales monthlySales={dashboardData.monthlySales} />
      </div>

      <div className="row mt-4">
        <TopServices
          services={dashboardData.topServices}
          onOpenReport={() => setShowTopServicesReport(true)}
        />
        <TopDentists dentists={dashboardData.topDentists} />
      </div>

      {showTopServicesReport && (
        <TopServicesReport onClose={() => setShowTopServicesReport(false)} />
      )}

      {showTodayAppointmentsReport && (
        <TodayAppointmentsReport onClose={() => setShowTodayAppointmentsReport(false)} />
      )}
    </div>
  );
}
