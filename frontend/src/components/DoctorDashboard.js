import React, { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import api from '../services/api';

const DoctorDashboard = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Routes>
        <Route path="/" element={<DoctorHome />} />
        <Route path="/patients" element={<PatientList />} />
        <Route path="/patients/:patientId/predictions" element={<PatientPredictions />} />
        <Route path="/patients/:patientId/prescriptions" element={<PatientPrescriptions />} />
      </Routes>
    </div>
  );
};

const DoctorHome = () => {
  const [stats, setStats] = useState({ patients: 0, predictions: 0 });
  const [recentPatients, setRecentPatients] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await api.getPatients();
      const patients = response.data.patients;
      setRecentPatients(patients.slice(0, 5));

      const totalPredictions = patients.reduce((sum, patient) => sum + patient.prediction_count, 0);
      setStats({ patients: patients.length, predictions: totalPredictions });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div className="px-4 py-6 sm:px-0">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Doctor Dashboard</h1>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="card">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold">P</span>
                </div>
              </div>
              <div className="ml-4">
                <div className="text-sm font-medium text-gray-500">Total Patients</div>
                <div className="text-2xl font-bold text-gray-900">{stats.patients}</div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold">A</span>
                </div>
              </div>
              <div className="ml-4">
                <div className="text-sm font-medium text-gray-500">Total Predictions</div>
                <div className="text-2xl font-bold text-gray-900">{stats.predictions}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="card mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
          <div className="flex flex-wrap gap-4">
            <button
              onClick={() => window.location.href = '/doctor/patients?action=register'}
              className="btn-primary"
            >
              Register New Patient
            </button>
            <button
              onClick={() => window.location.href = '/doctor/patients'}
              className="btn-secondary"
            >
              View All Patients
            </button>
          </div>
        </div>

        {/* Recent Patients */}
        <div className="card">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Patients</h2>
          {recentPatients.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Predictions
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {recentPatients.map((patient) => (
                    <tr key={patient.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {patient.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {patient.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {patient.prediction_count || 0}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => window.location.href = `/doctor/patients/${patient.id}/predictions`}
                          className="text-blue-600 hover:text-blue-900 mr-4"
                        >
                          View Predictions
                        </button>
                        <button
                          onClick={() => window.location.href = `/doctor/patients/${patient.id}/prescriptions`}
                          className="text-green-600 hover:text-green-900"
                        >
                          Prescriptions
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-500">No patients registered yet.</p>
          )}
        </div>
      </div>
    </div>
  );
};

const PatientList = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showRegisterForm, setShowRegisterForm] = useState(false);
  const [registerForm, setRegisterForm] = useState({
    patient_name: '',
    patient_email: '',
    gender: '',
    dob: ''
  });
  const [registerError, setRegisterError] = useState('');

  useEffect(() => {
    fetchPatients();
    // Check if we should show register form
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('action') === 'register') {
      setShowRegisterForm(true);
    }
  }, []);

  const fetchPatients = async () => {
    try {
      const response = await api.getPatients();
      setPatients(response.data.patients);
    } catch (error) {
      console.error('Error fetching patients:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setRegisterError('');

    try {
      await api.registerPatient(registerForm);
      setShowRegisterForm(false);
      setRegisterForm({ patient_name: '', patient_email: '', gender: '', dob: '' });
      fetchPatients(); // Refresh the list
    } catch (error) {
      setRegisterError(error.response?.data?.error || 'Registration failed');
    }
  };

  const exportPredictions = async (patientId) => {
    try {
      const response = await api.exportPredictions(patientId);
      const blob = new Blob([response.data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `patient_${patientId}_predictions.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">Loading patients...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div className="px-4 py-6 sm:px-0">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Patients</h1>
          <button
            onClick={() => setShowRegisterForm(true)}
            className="btn-primary"
          >
            Register New Patient
          </button>
        </div>

        {/* Register Patient Modal */}
        {showRegisterForm && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Register New Patient</h3>
              <form onSubmit={handleRegisterSubmit}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Patient Name
                    </label>
                    <input
                      type="text"
                      required
                      className="form-input"
                      value={registerForm.patient_name}
                      onChange={(e) => setRegisterForm({...registerForm, patient_name: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Email
                    </label>
                    <input
                      type="email"
                      required
                      className="form-input"
                      value={registerForm.patient_email}
                      onChange={(e) => setRegisterForm({...registerForm, patient_email: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Gender
                    </label>
                    <select
                      className="form-input"
                      value={registerForm.gender}
                      onChange={(e) => setRegisterForm({...registerForm, gender: e.target.value})}
                    >
                      <option value="">Select Gender</option>
                      <option value="0">Female</option>
                      <option value="1">Male</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Date of Birth (Optional)
                    </label>
                    <input
                      type="date"
                      className="form-input"
                      value={registerForm.dob}
                      onChange={(e) => setRegisterForm({...registerForm, dob: e.target.value})}
                    />
                  </div>
                </div>

                {registerError && (
                  <div className="alert-error mt-4">
                    {registerError}
                  </div>
                )}

                <div className="flex gap-4 mt-6">
                  <button type="submit" className="btn-primary">
                    Register
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowRegisterForm(false)}
                    className="btn-secondary"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Patients Table */}
        <div className="card">
          {patients.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Predictions
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Registered
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {patients.map((patient) => (
                    <tr key={patient.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {patient.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {patient.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {patient.prediction_count || 0}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(patient.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        <button
                          onClick={() => window.location.href = `/doctor/patients/${patient.id}/predictions`}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          View
                        </button>
                        <button
                          onClick={() => window.location.href = `/doctor/patients/${patient.id}/prescriptions`}
                          className="text-green-600 hover:text-green-900"
                        >
                          Prescriptions
                        </button>
                        <button
                          onClick={() => exportPredictions(patient.id)}
                          className="text-purple-600 hover:text-purple-900"
                        >
                          Export
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No patients registered yet.</p>
          )}
        </div>
      </div>
    </div>
  );
};

const PatientPredictions = () => {
  // Placeholder for patient predictions view
  return <div>Patient Predictions Component</div>;
};

const PatientPrescriptions = () => {
  // Placeholder for patient prescriptions management
  return <div>Patient Prescriptions Component</div>;
};

export default DoctorDashboard;
