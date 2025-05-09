import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../index.css';

const Login = () => {
  const [maximized, setMaximized] = useState(null); // 'left' | 'right' | null

  const togglePanel = () => {
    if (maximized === 'left') {
      setMaximized('right');
    } else if (maximized === 'right') {
      setMaximized('left');
    }
  };

  const handleMaximize = (panel) => {
    setMaximized(panel === maximized ? null : panel);
  };

  return (
    <div
      className={`split-page-container ${
        maximized === 'left'
          ? 'maximized-left'
          : maximized === 'right'
          ? 'maximized-right'
          : ''
      }`}
    >
      <div
        className={`left-panel ${maximized === 'left' ? 'full' : ''}`}
        onClick={() => handleMaximize('left')}
      >
        <h1>ToothPix here</h1>
        <h2>WELCOME!</h2>
        <p>Click the button to download the app</p>
        <button className="custom-button">Download</button>
      </div>

      {maximized && (
        <button className="middle-button" onClick={togglePanel}>
          {maximized === 'left' ? '>' : '<'}
        </button>
      )}

      <div
        className={`right-panel ${maximized === 'right' ? 'full' : ''}`}
        onClick={() => handleMaximize('right')}
      >
        <div className="login-card">
          <h1 className="big-text-with-border">Admin Login</h1>
          <form>
            <div className="mb-3">
              <label htmlFor="username" className="form-label">Username</label>
              <input type="text" id="username" className="form-control" placeholder="Enter your username" />
            </div>

            <div className="mb-3">
              <label htmlFor="password" className="form-label">Password</label>
              <input type="password" id="password" className="form-control" placeholder="Enter your password" />
            </div>

            <div className="d-grid">
              <button type="submit" className="btn btn-primary">Login</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
