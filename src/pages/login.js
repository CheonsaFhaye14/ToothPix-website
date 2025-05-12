import React, { useState } from 'react';
import '../design/login.css';
import { useHistory } from 'react-router-dom';

const Login = () => {
  const [maximized, setMaximized] = useState(null);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const history = useHistory();


  const handleBackgroundClick = (side) => {
    setMaximized(maximized === side ? null : side);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(''); // Clear previous messages

    try {
        const response = await fetch('https://toothpix-backend.onrender.com/api/app/admin', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password }),
          });
          
          console.log('Response Status:', response.status); // Log status code
          const data = await response.json();
          console.log('Response Data:', data); // Log response data
          
          if (response.ok) {
            localStorage.setItem('adminToken', data.token); // Store the token
             history.push('/dashboard');
          } else {
            setMessage(data.message || 'Login failed.');
          }
          
    } catch (error) {
      console.error('Error:', error);
      setMessage('An error occurred. Please try again.');
    }
  };

  return (
    <div className={`split-page-container ${maximized === 'left' ? 'maximized-left' : ''} ${maximized === 'right' ? 'maximized-right' : ''}`}>
      {/* LEFT PANEL */}
      <div className="left-panel" onClick={() => handleBackgroundClick('left')}>
        <h1>ToothPix here</h1>
        <h2>WELCOME!</h2>
        <p>Click the button to download the app</p>
        <a
          className="custom-button"
          href="https://drive.google.com/uc?export=download&id=1QEQevmMs22I5wjWP3p083QGJAVRC1Dbo"
          target="_blank"
          rel="noopener noreferrer"
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
                <input
                  type="password"
                  id="password"
                  className="form-control"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              <div className="d-grid">
                <button type="submit" className="btn btn-primary">Login</button>
              </div>
            </form>

            {message && <div className="alert alert-info mt-3">{message}</div>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
