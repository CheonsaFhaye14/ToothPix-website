import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BASE_URL } from './config';

export function useAuth() {
  const [message, setMessage] = useState('');
  const [message2, setMessage2] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState({
    totalServices: 0,
    totalAppointments: 0,
    totalDentists: 0,
    totalPatients: 0,
  });
  const [allPatientData, setAllPatientData] = useState([]);
  const [showReport, setShowReport] = useState(false);

  const history = useNavigate();

  /** LOGIN */
  const handleLogin = async (username, password) => {
    setMessage('');
    setIsLoggingIn(true);

    try {
      const res = await fetch(`${BASE_URL}/api/website/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (res.ok) {
        localStorage.setItem('adminToken', data.token);
        localStorage.setItem('adminId', data.user.idusers);
        localStorage.setItem('adminUsername', data.user.username);

        history('/dashboard');
      } else {
        setMessage(data.message || 'Login failed.');
      }
    } catch (err) {
      console.error('Login error:', err);
      setMessage('An error occurred. Please try again.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  /** FORGOT PASSWORD */
  const handleForgotPassword = async (email, closeModalCallback) => {
    setMessage2('');

    try {
      // Step 1: Check if email exists
      const res = await fetch(`${BASE_URL}/api/admin`);
      const data = await res.json();

      if (!res.ok) {
        setMessage2('Admin details not found.');
        return;
      }

      const adminEmails = data.admin.map(a => a.email.toLowerCase());

      if (!adminEmails.includes(email.toLowerCase())) {
        setMessage2('Email does not match any admin account.');
        return;
      }

      // Step 2: Request reset
      const resetRes = await fetch(`${BASE_URL}/api/Reset Password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const resetData = await resetRes.json();

      if (resetRes.ok) {
        setMessage2('Password reset link sent to your email!');
        closeModalCallback(false);
      } else {
        console.error('Reset error:', resetData);
        setMessage2(
          resetData.message || resetData.error || 
          'Something went wrong while requesting password reset.'
        );
      }
    } catch (err) {
      console.error('Forgot password error:', err);
      setMessage2('An error occurred. Please try again.');
    }
  };

  /** RESET PASSWORD */
  const handleResetPassword = async (token, newPassword, confirmPassword) => {
    setMessage('');
    setLoading(true);

    if (newPassword.length < 6) {
      setMessage('Password must be at least 6 characters long.');
      setLoading(false);
      return;
    }

    if (newPassword !== confirmPassword) {
      setMessage('Passwords do not match.');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`${BASE_URL}/api/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword }),
      });

      const data = await res.json();

      if (res.ok) {
        if (data.usertype === 'admin') {
          history('/login');
        } else {
          setMessage('Password successfully changed. You can now log in.');
        }
      } else {
        setMessage(data.message || 'Failed to reset password.');
      }
    } catch (err) {
      console.error('Reset password error:', err);
      setMessage('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  /** DASHBOARD SUMMARY */
  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const endpoints = [
          { key: 'totalServices', url: `${BASE_URL}/api/app/services`, field: 'services' },
          { key: 'totalAppointments', url: `${BASE_URL}/api/app/appointments`, field: 'appointments' },
          { key: 'totalDentists', url: `${BASE_URL}/api/app/dentists`, field: 'dentists' },
          { key: 'totalPatients', url: `${BASE_URL}/api/app/patients`, field: 'patients' },
        ];

        for (const ep of endpoints) {
          const res = await fetch(ep.url);
          const data = await res.json();
          if (res.ok) {
            setSummary(prev => ({ ...prev, [ep.key]: data[ep.field]?.length || 0 }));
          }
        }
      } catch (err) {
        console.error('Error fetching dashboard summary:', err);
      }
    };

    fetchSummary();
  }, []);

  /** FETCH PATIENT REPORT */
  const handlePatientsClick = async () => {
    try {
      const res = await fetch(`${BASE_URL}/api/website/report/patients`);
      const data = await res.json();
      setAllPatientData(data);
      setShowReport(true);
    } catch (err) {
      console.error('Failed to fetch patients report:', err);
    }
  };

  return {
    message,
    message2,
    isLoggingIn,
    loading,
    summary,
    allPatientData,
    showReport,
    handleLogin,
    handleForgotPassword,
    handleResetPassword,
    handlePatientsClick,
  };
}
