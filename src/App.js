import { HashRouter as Router, Route, Switch } from 'react-router-dom';
import Page1 from './pages/page1';
import Login from './pages/login';
import Dashboard from './pages/Dashboard/AdminDashboard';
import Sidebar from './pages/sidebar';  // Import the Sidebar component
import './index.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import Appointment from './pages/Appointments/appointment';
import Users from './pages/Users/users';
import Record from './pages/Records/record';
import Service from './pages/Services/service';
import ResetPassword from './pages/resetpassword';
import Payment from './pages/Payment/payment';
import ThreeDModelManager from './pages/3dModel/3dmodel';
import ActivityLog from './pages/ActivityLog/activitylog';
import { useHistory } from 'react-router-dom';

// Layout wrapper for pages that need the sidebar
const DashboardLayout = ({ component: Component, ...rest }) => {
  const history = useHistory(); // <-- Add this

  const handleLogout = () => {
    localStorage.removeItem("token");
    history.push("/login"); // <- This respects basename automatically
  };

  return (
    <Route
      {...rest}
      render={(props) => (
        <>
          <div style={{ position: 'fixed', top: 0, left: 0, zIndex: 1100 }}>
            <Sidebar />
          </div>

          <nav
            className="navbar justify-content-end px-4 shadow-sm"
            style={{
              height: '50px',
              width: 'calc(100vw - 220px)',
              position: 'fixed',
              backgroundColor: '#6bb8fa',
              color: 'white',
              top: 0,
              left: '220px',
              zIndex: 1000
            }}
          >
            <div className="d-flex align-items-center gap-3">
<button className="btn btn-outline-light btn-sm" onClick={handleLogout}>
                Logout
              </button>
            </div>
          </nav>

          <div className="d-flex" style={{ paddingTop: '60px', marginLeft: '220px', minHeight: '100vh' }}>
            <div className="dashboard-content p-4 w-100">
              <Component {...props} />
            </div>
          </div>
        </>
      )}
    />
  );
};





function App() {
  return (
    <Router basename="/ToothPix-website">
      <div className="App">
        <Switch>
          <Route exact path="/" component={Page1} />
          <Route path="/login" component={Login} />
          <Route path="/resetpassword" component={ResetPassword} />
          <DashboardLayout path="/dashboard" component={Dashboard} />
          <DashboardLayout path="/appointments" component={Appointment} /> {/* Add the Appointment route */}
          <DashboardLayout path="/users" component={Users} />
          <DashboardLayout path="/record" component={Record} />
          <DashboardLayout path="/payment" component={Payment} />
          <DashboardLayout path="/service" component={Service} />
          <DashboardLayout path="/3dmodel" component={ThreeDModelManager} />
          <DashboardLayout path="/activitylog" component={ActivityLog} />   
          </Switch>
      </div>
    </Router>
  );
}

export default App;
