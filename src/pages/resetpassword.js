import { useEffect, useState } from 'react';
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import { BASE_URL } from '../config';
import FloatingInput from '../utils/InputForm';
// import './ResetPassword.css'; // assuming you have styles

const ResetPassword = () => {
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const hash = window.location.hash.slice(1);
  const token = new URLSearchParams(hash.split('?')[1]).get('token');

  useEffect(() => {
    if (!token) setMessage('Invalid token.');
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
        setMessage('✅ Password successfully changed!');
        setTimeout(() => navigate("/login"), 2000);
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
          {message && <div className={`message ${message.startsWith('✅') ? 'success-text' : 'error-text'}`}>{message}</div>}
          <form onSubmit={handleSubmit}>
            
            {/* New Password */}
            <div className="mb-3 input-wrapper">
              <FloatingInput
                placeholder="New Password"
                type={showNewPassword ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
              <span className="toggle-password" onClick={() => setShowNewPassword(!showNewPassword)}>
                <FontAwesomeIcon icon={showNewPassword ? faEyeSlash : faEye} />
              </span>
            </div>

            {/* Confirm Password */}
            <div className="mb-3 input-wrapper">
              <FloatingInput
                placeholder="Confirm Password"
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
              <span className="toggle-password" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                <FontAwesomeIcon icon={showConfirmPassword ? faEyeSlash : faEye} />
              </span>
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
