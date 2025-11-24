import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { BASE_URL } from '../../config';
import './AdminDashboard.css';
import '../../design/Modal.css';

import AppointmentTodayCard from './AppointmentTodayCard';
import EarningsCard from './EarningsCard';
import TopServices from './TopServices';
import TopDentists from './TopDentists';
import GraphSales from './GraphSales';
import TopServicesReport from './TopServicesReport';
import TodayAppointmentsReport from './TodayAppointmentsReport'; // Import modal for today's appointments
import TopDentistsReport from './TopDentistReport';

export default function AdminDashboard() {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showTopServicesReport, setShowTopServicesReport] = useState(false);
  const [showTodayAppointmentsReport, setShowTodayAppointmentsReport] = useState(false); // new state
  const [showTopDentistsReport, setShowTopDentistsReport] = useState(false);

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
    <h1>Dashboard</h1>

    {/* --- First Row: 2 cards --- */}
    <div className="row">
      <AppointmentTodayCard
        count={dashboardData.totalAppointmentsToday}
        onClick={() => setShowTodayAppointmentsReport(true)}
      />
      <EarningsCard earnings={dashboardData.thisMonthEarnings} />
    </div>

    {/* --- Second Row: 1 card --- */}
    <div className="row">
      <GraphSales monthlySales={dashboardData.monthlySales} />
    </div>

    {/* --- Third Row: 2 cards --- */}
    <div className="row">
      <TopServices
        services={dashboardData.topServices}
        onOpenReport={() => setShowTopServicesReport(true)}
      />
      <TopDentists 
        dentists={dashboardData.topDentists} 
        onOpenReport={() => setShowTopDentistsReport(true)}  
      />
    </div>

    {showTopServicesReport && (
      <TopServicesReport onClose={() => setShowTopServicesReport(false)} />
    )}
    
    {showTopDentistsReport && (
      <TopDentistsReport onClose={() => setShowTopDentistsReport(false)} />
    )}

    {showTodayAppointmentsReport && (
      <TodayAppointmentsReport onClose={() => setShowTodayAppointmentsReport(false)} />
    )}
  </div>

  );
}
