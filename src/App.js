import './App.css';
import { Routes, Route, Navigate } from "react-router-dom";

import HomePage from './pages/Start/homepage';
import AboutPage from './pages/Start/About';
import Login from './pages/login';
import ResetPassword from './pages/resetpassword';
import Download from './pages/Start/Download';

import Dashboard from './pages/Dashboard/AdminDashboard';
import Appointment from './pages/Appointments/appointment';
import Users from './pages/Users/users';
import Record from './pages/Records/record';
import Service from './pages/Services/service';
import Payment from './pages/Payment/payment';
import ThreeDModelManager from './pages/3dModel/3dmodel';
import ActivityLog from './pages/ActivityLog/activitylog';

import PublicLayout from './pages/Start/PublicLayout';
import AdminLayout from './pages/Start/AdminLayout';

import { AdminAuthProvider } from './Hooks/Auth/AdminAuthProvider';
import { useAdminAuth } from './Hooks/Auth/useAdminAuth';

// ✅ Protected admin route must be inside provider
function ProtectedAdminRoute({ children }) {
  const { token } = useAdminAuth();
  if (!token) return <Navigate to="/login" replace />;
  return children;
}

function App() {
  return (
    <AdminAuthProvider>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<PublicLayout><HomePage /></PublicLayout>} />
        <Route path="/login" element={<PublicLayout><Login /></PublicLayout>} />
        <Route path="/resetpassword" element={<PublicLayout><ResetPassword /></PublicLayout>} />
        <Route path="/about" element={<PublicLayout><AboutPage /></PublicLayout>} />
        <Route path="/download" element={<PublicLayout><Download /></PublicLayout>} />

        {/* Admin Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedAdminRoute>
              <AdminLayout><Dashboard /></AdminLayout>
            </ProtectedAdminRoute>
          }
        />
        <Route
          path="/appointments"
          element={
            <ProtectedAdminRoute>
              <AdminLayout><Appointment /></AdminLayout>
            </ProtectedAdminRoute>
          }
        />
        <Route
          path="/users"
          element={
            <ProtectedAdminRoute>
              <AdminLayout><Users /></AdminLayout>
            </ProtectedAdminRoute>
          }
        />
        <Route
          path="/record"
          element={
            <ProtectedAdminRoute>
              <AdminLayout><Record /></AdminLayout>
            </ProtectedAdminRoute>
          }
        />
        <Route
          path="/payment"
          element={
            <ProtectedAdminRoute>
              <AdminLayout><Payment /></AdminLayout>
            </ProtectedAdminRoute>
          }
        />
        <Route
          path="/service"
          element={
            <ProtectedAdminRoute>
              <AdminLayout><Service /></AdminLayout>
            </ProtectedAdminRoute>
          }
        />
        <Route
          path="/3dmodel"
          element={
            <ProtectedAdminRoute>
              <AdminLayout><ThreeDModelManager /></AdminLayout>
            </ProtectedAdminRoute>
          }
        />
        <Route
          path="/activitylog"
          element={
            <ProtectedAdminRoute>
              <AdminLayout><ActivityLog /></AdminLayout>
            </ProtectedAdminRoute>
          }
        />

        {/* Fallback for unmatched routes */}
        <Route path="*" element={<PublicLayout><HomePage /></PublicLayout>} />
      </Routes>
    </AdminAuthProvider>
  );
}

export default App;
