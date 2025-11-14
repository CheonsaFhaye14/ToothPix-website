import './About.css';
import { useNavigate } from "react-router-dom";

function About() {
  const navigate = useNavigate();

  const handleDownloadClick = () => {
    navigate("/download"); // navigate to /download route
  };

  return (
    <div className="about-container">
      <h1>Learn More About Smart Dental Clinic</h1>

      {/* Mission Section */}
      <section className="about-section">
        <h2>Our Mission</h2>
        <p>
          At Smart Dental Clinic, we aim to make dental care interactive, easy, and
          understandable for everyone. Our 3D dental visualization system allows patients
          to see their treatments before they happen and understand their oral health better.
        </p>
      </section>

      {/* General Objective */}
      <section className="about-section">
        <h2>General Objective</h2>
        <p>
          To develop an efficient dental management system that facilitates appointment scheduling, 
          patient record management, and total payment tracking, while also utilizing 3D Model dental visualization.
        </p>
      </section>

      {/* Specific Objectives */}
      <section className="about-section">
        <h2>Specific Objectives</h2>
        <ul>
          <li>Create a secure and easy-to-use system for managing and storing patient records, ensuring quick access and accuracy of information.</li>
          <li>Develop a feature that simplifies scheduling appointments and sending reminders to patients and staff, reducing missed appointments.</li>
          <li>Add 3D Model dental visualization technology, allowing patients to see "before and after" images of treatments, improving understanding of procedures.</li>
          <li>Build a payment tracking feature that records and monitors all patient transactions for organized financial management.</li>
        </ul>
      </section>

      {/* Call-to-Action Section */}
      <section className="about-section cta-section">
        <h2>Ready to Get Started?</h2>
        <p>Download our app now and explore your 3D dental experience!</p>
        {/* Use button and navigate */}
        <button 
          className="cta-button" 
          onClick={handleDownloadClick}
        >
          Download the App
        </button>
      </section>
    </div>
  );
}

export default About;
