import React, { useState } from 'react';
import '../design/login.css';
import { useHistory } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';

const Login = () => {
  const [maximized, setMaximized] = useState(null);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState('');
  const [message2, setMessage2] = useState('');
  const [showModal, setShowModal] = useState(false); // State for controlling modal visibility
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [email, setEmail] = useState(''); // State for email input in the modal
  const history = useHistory();

  const handleBackgroundClick = (side) => {
    setMaximized(maximized === side ? null : side);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setIsLoggingIn(true); // Set loading state
  
    try {
      const response = await fetch('https://toothpix-backend.onrender.com/api/website/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
  
      const data = await response.json();
  
      if (response.ok) {
        localStorage.setItem('adminToken', data.token);
        history.push('/dashboard');
      } else {
        setMessage(data.message || 'Login failed.');
      }
    } catch (error) {
      console.error('Error:', error);
      setMessage('An error occurred. Please try again.');
    } finally {
      setIsLoggingIn(false); // Reset loading state
    }
  };
  

// Forgot Password form (onSubmit) – send token-based reset request:
const handleForgotPasswordSubmit = async (e) => {
    e.preventDefault();
    setMessage2(''); // Clear any previous message
    
    try {
      // Step 1: Verify admin email exists in the backend
      const response = await fetch('https://toothpix-backend.onrender.com/api/admin');
      const data = await response.json();
  
      if (response.ok) {
        const adminEmails = data.admin.map(admin => admin.email.toLowerCase());
if (adminEmails.includes(email.toLowerCase())) {
          // Step 2: Generate and send password reset link to the admin's email
          const resetResponse = await fetch('https://toothpix-backend.onrender.com/api/request-reset-password', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email }),
          });
  
          const resetData = await resetResponse.json();
if (resetResponse.ok) {
  setMessage2('Password reset link sent to your email!');
  setShowModal(false);
} else {
  console.error('Reset Error:', resetData); // log for debugging
  setMessage2(
    resetData.message ||
    resetData.error ||
    'Something went wrong while requesting a password reset. Please try again or contact support.'
  );
}

        } else {
  setMessage2('Email does not match any admin account.');
}
      } else {
        setMessage2('Admin details not found.');
      }
    } catch (error) {
      console.error('Error:', error);
      setMessage2('An error occurred. Please try again.');
    }
  };
  
  

  return (
    <div className={`split-page-container ${maximized === 'left' ? 'maximized-left' : ''} ${maximized === 'right' ? 'maximized-right' : ''}`}>
      {/* LEFT PANEL */}
      <div className="left-panel" onClick={() => handleBackgroundClick('left')}>
        <h1>Smart Dental here</h1>
        <h2>WELCOME!</h2>
        <p>Click the button to download the app</p>
     <a
  className="custom-button"
  href="https://drive.google.com/uc?export=download&id=1maTYnsjtd7mITpMNHpcKSy5YWaKTbD0-"
  download
>
  Download
</a>

      </div>

      {/* RIGHT PANEL */}
      <div className="right-panel">
        <div className="right-background" onClick={() => handleBackgroundClick('right')}>
          <div className="login-card" onClick={(e) => e.stopPropagation()}>
            <h1 className='big-text-with-border'>Admin Login</h1>
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label htmlFor="username" className="form-label">Username</label>
                <input
                  type="text"
                  id="username"
                  className="form-control"
                  placeholder="Enter your username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>

              <div className="mb-3">
                <label htmlFor="password" className="form-label">Password</label>
                <div className="input-wrapper">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  className="form-control password-input"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <span
                  className="toggle-password"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
                </span>
              </div>
              </div>

             {/* Forgot Password link */}
             <div className="forgot-password">
  <button
    type="button"
    onClick={() => setShowModal(true)}
    className="forgot-password-link"
  >
    Forgot Password?
  </button>
</div>



              <div className="d-grid">
              <button type="submit" className="btn-primary" disabled={isLoggingIn}>
  {isLoggingIn ? 'Logging in...' : 'Login'}
</button>

              </div>
            </form>

            {message && <div className="alert alert-info mt-3">{message}</div>}
          </div>
        </div>
      </div>

{/* Modal for Forgot Password */}
{showModal && (
  <div className="modal-background" onClick={() => setShowModal(false)}>
    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
      <h3 className='big-text-with-border'>Reset Password</h3>
      <form onSubmit={handleForgotPasswordSubmit}>
        <div className="mb-3">
          <label htmlFor="email" className="form-label">Email</label>
          <input
            type="email"
            id="email"
            className="form-control"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="d-grid">
          <button type="submit" className="btn-primary">Send Reset Link</button>
        </div>
      </form>
      <button className="btn-secondary" onClick={() => setShowModal(false)}>Close</button>

      {message2 && <div className="alert alert-info mt-3">{message2}</div>}
    </div>
  </div>
)}


    </div>
  );
};

export default Login;
