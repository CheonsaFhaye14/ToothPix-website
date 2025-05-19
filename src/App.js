import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import Page1 from './pages/page1';
import Login from './pages/login';
import Dashboard from './pages/dashboard';
import Sidebar from './pages/sidebar';  // Import the Sidebar component
import './index.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import Appointment from './pages/appointment';
import Users from './pages/users';
import Record from './pages/record';
import Service from './pages/service';
import Settings from './pages/settings';
import Help from './pages/help';
import ResetPassword from './pages/resetpassword';
// Layout wrapper for pages that need the sidebar
const DashboardLayout = ({ component: Component, ...rest }) => {
  return (
    <Route
      {...rest}
      render={(props) => (
        <>
          {/* Sidebar - on top layer */}
          <div style={{ position: 'fixed', top: 0, left: 0, zIndex: 1100 }}>
            <Sidebar />
          </div>

          {/* Top Navbar - behind sidebar */}
          <nav
  className="navbar justify-content-end px-4 shadow-sm"
  style={{
    height: '50px',
    width: 'calc(100vw - 220px)', // Adjusts based on sidebar width
    position: 'fixed',
    backgroundColor: '#6bb8fa', // Match sidebar
    color: 'white',
    top: 0,
    left: '220px', // Match sidebar width
    zIndex: 1000
  }}
>
  <div className="d-flex align-items-center gap-3">
    <a href="/help" className="text-decoration-none text-white">Help</a>
    <a href="/settings" className="text-decoration-none text-white">Settings</a>
    <button
      className="btn btn-outline-light btn-sm"
      onClick={() => {
        localStorage.removeItem("token");
        window.location.href = "/login";
      }}
    >
      Logout
    </button>
  </div>
</nav>

          {/* Main content area */}
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
          <DashboardLayout path="/service" component={Service} />
          <DashboardLayout path="/settings" component={Settings} />
          <DashboardLayout path="/help" component={Help} />
          </Switch>
      </div>
    </Router>
  );
}

export default App;
