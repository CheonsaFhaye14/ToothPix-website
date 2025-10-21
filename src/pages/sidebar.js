import { Link, useLocation } from 'react-router-dom'; // Import useLocation
import '../design/sidebar.css';
import '../design/users.css';
import '../design/dashboard.css';
import '../design/service.css';
import '../design/record.css'; 
import '../design/page1.css';
import '../design/login.css';
import '../design/appointment.css';

const Sidebar = () => {
  const location = useLocation(); // Get current route

  return (
    <div className="sidebar">
      <h3 className="sidebar-title">Smart Dental Admin</h3>
      <ul className="sidebar-nav">
        <li>
          <Link 
            to="/dashboard" 
            className={`nav-link ${location.pathname === '/dashboard' ? 'active' : ''}`}
          >
            Dashboard
          </Link>
        </li>
        <li>
          <Link 
            to="/users" 
            className={`nav-link ${location.pathname === '/users' ? 'active' : ''}`}
          >
            Users
          </Link>
        </li>
        <li>
          <Link 
            to="/service" 
            className={`nav-link ${location.pathname === '/service' ? 'active' : ''}`}
          >
            Service
          </Link>
        </li>
        <li>
          <Link 
            to="/appointments" 
            className={`nav-link ${location.pathname === '/appointments' ? 'active' : ''}`}
          >
            Appointments
          </Link>
        </li>
        <li>
          <Link 
            to="/record" 
            className={`nav-link ${location.pathname === '/record' ? 'active' : ''}`}
          >
            Record
          </Link>
        </li>
        <li>
          <Link 
            to="/payment" 
            className={`nav-link ${location.pathname === '/payment' ? 'active' : ''}`}
          >
            Payment
          </Link>
        </li>
        <li>
          <Link 
            to="/3dmodel" 
            className={`nav-link ${location.pathname === '/3dmodel' ? 'active' : ''}`}
          >
            3d Model
          </Link>
        </li>
         <li>
          <Link 
            to="/activitylog" 
            className={`nav-link ${location.pathname === '/activitylog' ? 'active' : ''}`}
          >
            Activity Log
          </Link>
        </li>
      </ul>
    </div>
  );
};

export default Sidebar;
