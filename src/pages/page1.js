import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../index.css';

const Page1 = () => {
  const [maximized, setMaximized] = useState(null);

  const handleBackgroundClick = (side) => {
    setMaximized(maximized === side ? null : side);
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
        {/* This div is ONLY the background area, receives the click */}
        <div className="right-background" onClick={() => handleBackgroundClick('right')}>
          {/* Stop clicks inside the card from bubbling up to the background */}
          <div className="login-card" onClick={(e) => e.stopPropagation()}>
            <h1 className='big-text-with-border'>Admin Login</h1>
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
    </div>
  );
};

export default Page1;
