import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginPage from './components/LoginPage';
import PatientDashboard from './components/PatientDashboard';
import DoctorDashboard from './components/DoctorDashboard';
import PredictionForm from './components/PredictionForm';
import PrescriptionView from './components/PrescriptionView';
import RegisterDoctor from './components/RegisterDoctor';
import Navbar from './components/Navbar';
import './index.css';

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

// Main App Content (inside Router)
const AppContent = () => {
  const { user } = useAuth();
  const location = useLocation();
  const authPaths = ['/login', '/register-doctor'];
  const hideNav = authPaths.includes(location.pathname);

  return (
    <div className={`min-h-screen ${hideNav ? 'auth-bg flex items-center justify-center py-12' : 'bg-gradient-radial from-brand-50 to-white dark:from-slate-950 dark:to-slate-950/90'} transition-colors`}>
      {!hideNav && user && <Navbar />}
      <main className={`${!hideNav && user ? 'pt-24' : ''} pb-12 w-full animate-fade-in`}>
        <Routes>
          {/* Public Routes */}
          <Route
            path="/login"
            element={
              user ? (
                <Navigate to={user.role === 'doctor' ? '/doctor' : '/patient'} replace />
              ) : (
                <LoginPage />
              )
            }
          />
          <Route
            path="/register-doctor"
            element={
              user ? (
                <Navigate to={user.role === 'doctor' ? '/doctor' : '/patient'} replace />
              ) : (
                <RegisterDoctor />
              )
            }
          />

          {/* Patient Routes */}
          <Route
            path="/patient"
            element={
              <ProtectedRoute allowedRoles={['user', 'patient']}>
                <PatientDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/patient/predict"
            element={
              <ProtectedRoute allowedRoles={['user', 'patient']}>
                <PredictionForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="/patient/prescriptions"
            element={
              <ProtectedRoute allowedRoles={['user', 'patient']}>
                <PrescriptionView />
              </ProtectedRoute>
            }
          />

          {/* Doctor Routes */}
          <Route
            path="/doctor/*"
            element={
              <ProtectedRoute allowedRoles={['doctor']}>
                <DoctorDashboard />
              </ProtectedRoute>
            }
          />

          {/* General Dashboard */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                {user?.role === 'doctor' ? <DoctorDashboard /> : <PatientDashboard />}
              </ProtectedRoute>
            }
          />

          {/* Unauthorized */}
          <Route
            path="/unauthorized"
            element={
              <div className="flex justify-center items-center h-[60vh]">
                <div className="text-center card max-w-md">
                  <h1 className="heading mb-2 text-accent-600">Unauthorized</h1>
                  <p className="subtle">You don't have permission to access this page.</p>
                </div>
              </div>
            }
          />

          {/* Root Redirect */}
          <Route
            path="/"
            element={
              user ? (
                <Navigate to={user.role === 'doctor' ? '/doctor' : '/patient'} replace />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

export default App;
