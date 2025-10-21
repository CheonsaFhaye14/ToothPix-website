import { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import { BASE_URL } from '../config';

const ResetPassword = () => {
  const history = useHistory();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

const hash = window.location.hash.slice(1); // "/resetpassword?token=abcdef123456"
const token = new URLSearchParams(hash.split('?')[1]).get('token');

  useEffect(() => {
    if (!token) {
      setMessage('Invalid token.');
    }
  }, [token]);

const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);
  setMessage('');

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
    const response = await fetch(`${BASE_URL}/api/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, newPassword }),
    });

    const data = await response.json();

    if (response.ok) {
      if (data.usertype === 'admin') {
        // For admin, redirect to login page immediately
        history.push('/login');
      } else {
        // For other users, show message to go back or try again
        setMessage('Password successfully changed. You can go back to the app and login again.');
      }
    } else {
      setMessage(data.message || 'Failed to reset password.');
    }
  } catch (error) {
    console.error('Error:', error);
    setMessage('An error occurred. Please try again.');
  } finally {
    setLoading(false);
  }
};


  return (
    <div className="reset-password-page">
      <div className="right-panel">
        <div className="login-card">
          <h2>Reset Password</h2>
          {message && <div className="message">{message}</div>}
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label htmlFor="newPassword" className="form-label">New Password</label>
              <div className="input-wrapper">
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  id="newPassword"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  className="form-control-pass"
                />
                <span
                  className="toggle-password"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                >
                  <FontAwesomeIcon icon={showNewPassword ? faEyeSlash : faEye} />
                </span>
              </div>
            </div>

            <div className="mb-3">
              <label htmlFor="confirmPassword" className="form-label">Confirm Password</label>
              <div className="input-wrapper">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="form-control-pass"
                />
                <span
                  className="toggle-password"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                 <FontAwesomeIcon icon={showConfirmPassword ? faEyeSlash : faEye} />

                </span>
              </div>
            </div>

     <button type="submit" className="btn-primary" disabled={loading || !token}>
  {loading ? 'Loading...' : 'Reset Password'}
</button>

          </form>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
