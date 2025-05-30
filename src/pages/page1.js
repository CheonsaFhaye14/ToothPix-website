import { Link } from 'react-router-dom';
import logo from '../logo.png'; // Replace with actual logo path
import '../design/page1.css';

const Page1 = () => {
  return (
    <div className="page1-container">
  <div className="content-container">
    <img src={logo} alt="ToothPix Logo" className="logo" />
    <h1 className="title">Welcome to <span className="highlight">ToothPix</span></h1>
    <p className="intro-text">
      Smart Dental Clinic Management System with AR-Based Dental Visualization.
    </p>
    <div className="about-section">
      <h4 className="about-title">What is ToothPix?</h4>
      <p>
        ToothPix is a cutting-edge dental clinic management system designed to make dental practices more efficient and accessible.
        It integrates augmented reality (AR) technology to provide real-time dental visualization, helping both patients and dentists understand
        treatment plans and oral health in an interactive way.
      </p>
      <p>
        Our platform allows dental professionals to manage appointments, keep track of patient records, and provide personalized care with advanced features and tools.
        With ToothPix, we aim to improve the patient experience and optimize the clinic workflow.
      </p>
    </div>
    <Link to="/login">
  <button className="btn-primary">Get Started</button>
</Link>

  </div>
</div>

  );
};

export default Page1;
