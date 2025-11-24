import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BASE_URL } from '../config';
import { useAdminAuth } from '../Hooks/Auth/useAdminAuth';

export function useAuth() {
  const [message, setMessage] = useState('');
  const [message2, setMessage2] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [loading, setLoading] = useState(false);

  const history = useNavigate();
  const { login } = useAdminAuth();

/** LOGIN */
const handleLogin = async (username, password) => {
  setMessage('');

  const trimmedUsername = username.trim();
  const trimmedPassword = password;

  // Early validation: check each field separately
  if (!trimmedUsername && !trimmedPassword) {
    setMessage('Please enter both username and password.');
    return;
  } else if (!trimmedUsername) {
    setMessage('Please enter your username.');
    return;
  } else if (!trimmedPassword) {
    setMessage('Please enter your password.');
    return;
  }

  setIsLoggingIn(true);

  try {
    const res = await fetch(`${BASE_URL}/api/website/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: trimmedUsername, password: trimmedPassword }),
    });

    let data;
    try {
      data = await res.json(); // parse JSON
    } catch (parseError) {
      console.error('Failed to parse response JSON:', parseError);
      setMessage('Unexpected response from server.');
      return;
    }

    if (res.ok && data?.token && data?.user?.idusers && data?.user?.username) {
      // Successful login
      login(data.token, data.user.idusers, data.user.username);
      history('/dashboard');

    } else if (data?.errors && Array.isArray(data.errors)) {
      setMessage(data.errors.map(err => err.msg).join(' | '));

    } else if (data?.message) {
      setMessage(data.message);

    } else {
      setMessage('Login failed. Please check your credentials.');
    }

  } catch (err) {
    console.error('Network or server error during login:', err);
    setMessage('Unable to connect to the server. Please try again later.');
  } finally {
    setIsLoggingIn(false);
  }
};


  /** FORGOT PASSWORD */
  const handleForgotPassword = async (email, closeModalCallback) => {
    setMessage2('');

    try {
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
        setMessage2(resetData.message || resetData.error || 'Something went wrong.');
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

  return {
    message,
    message2,
    isLoggingIn,
    loading,
    handleLogin,
    handleForgotPassword,
    handleResetPassword,
  };
}
