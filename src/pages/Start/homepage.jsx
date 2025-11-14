import './homepage.css';
import { useNavigate } from "react-router-dom";

const HomePage = () => {
  const navigate = useNavigate();

  const handleDownloadClick = () => {
    navigate("/download"); // navigates to /download route
  };

  return (
    <div className="home-container">
      <div className="home-content">
        {/* Hero Section */}
        <section className="hero">
          <h1>Welcome to Smart Dental Clinic</h1>
          <p className="subtitle">
            Experience dental care like never before with our 3D dental visualization system!
          </p>
          {/* Use a button for internal navigation */}
          <button 
            onClick={handleDownloadClick} 
            className="cta-button"
          >
            Get the App
          </button>
        </section>

        {/* Highlights Section */}
        <section className="highlights">
          <div className="highlight-card">
            <h3>3D Dental Visualization</h3>
            <p>See your dental treatments in interactive 3D models for a clear and engaging experience.</p>
          </div>
          <div className="highlight-card">
            <h3>Quick & Easy Appointments</h3>
            <p>Book, manage, and track your appointments directly from your device without hassle.</p>
          </div>
          <div className="highlight-card">
            <h3>Safe & Organized Records</h3>
            <p>All your dental records are stored securely and easily accessible anytime.</p>
          </div>
        </section>
      </div>
    </div>
  );
};

export default HomePage;
