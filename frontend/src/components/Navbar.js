import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-blue-600 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="text-xl font-bold">
              Anemia Prediction System
            </Link>
            {user?.role === 'doctor' && (
              <div className="ml-8 flex space-x-4">
                <Link
                  to="/doctor"
                  className="px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-700"
                >
                  Dashboard
                </Link>
                <Link
                  to="/doctor/patients"
                  className="px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-700"
                >
                  Patients
                </Link>
              </div>
            )}
            {user?.role === 'user' && (
              <div className="ml-8 flex space-x-4">
                <Link
                  to="/patient"
                  className="px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-700"
                >
                  Dashboard
                </Link>
                <Link
                  to="/patient/predict"
                  className="px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-700"
                >
                  New Prediction
                </Link>
                <Link
                  to="/patient/prescriptions"
                  className="px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-700"
                >
                  Prescriptions
                </Link>
              </div>
            )}
          </div>

          <div className="flex items-center space-x-4">
            <span className="text-sm">
              Welcome, {user?.name} ({user?.role === 'doctor' ? 'Doctor' : 'Patient'})
            </span>
            <button
              onClick={handleLogout}
              className="bg-blue-700 hover:bg-blue-800 px-3 py-2 rounded-md text-sm font-medium"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
