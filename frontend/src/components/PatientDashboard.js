import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import XAIExplanation from './XAIExplanation';

const PatientDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await api.getPatientDashboard();
      setDashboardData(response.data);
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

  const { recent_predictions = [], active_prescriptions = [], total_predictions = 0, doctor } = dashboardData || {};

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">
            Welcome, {user?.name}
          </h1>

          {/* Doctor Info */}
          {doctor && (
            <div className="card mb-8 bg-blue-50">
              <h2 className="text-lg font-semibold text-blue-900 mb-2">Your Doctor</h2>
              <p className="text-blue-800">
                <strong>Dr. {doctor.name}</strong> at {doctor.hospital}
              </p>
            </div>
          )}

          {/* Latest XAI Explanation for Recent Prediction */}
          {recent_predictions.length > 0 && (
            <div className="card mb-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Latest AI Explanation</h2>
              <XAIExplanation explanation={recent_predictions[0]?.explanations} />
            </div>
          )}

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="card">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold">T</span>
                  </div>
                </div>
                <div className="ml-4">
                  <div className="text-sm font-medium text-gray-500">Total Tests</div>
                  <div className="text-2xl font-bold text-gray-900">{total_predictions}</div>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold">R</span>
                  </div>
                </div>
                <div className="ml-4">
                  <div className="text-sm font-medium text-gray-500">Recent Tests</div>
                  <div className="text-2xl font-bold text-gray-900">{recent_predictions.length}</div>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold">P</span>
                  </div>
                </div>
                <div className="ml-4">
                  <div className="text-sm font-medium text-gray-500">Prescriptions</div>
                  <div className="text-2xl font-bold text-gray-900">{active_prescriptions.length}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="card mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
            <div className="flex flex-wrap gap-4">
              <Link to="/patient/predict" className="btn-primary">
                New Anemia Test
              </Link>
              <Link to="/patient/prescriptions" className="btn-secondary">
                View Prescriptions
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Recent Predictions */}
            <div className="card">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Test Results</h2>
              {recent_predictions.length > 0 ? (
                <div className="space-y-4">
                  {recent_predictions.map((prediction) => (
                    <div key={prediction.id} className="border-l-4 border-blue-500 pl-4 py-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className={`text-sm font-medium ${
                            prediction.predicted_label === 1 ? 'text-red-600' : 'text-green-600'
                          }`}>
                            {prediction.predicted_label === 1 ? 'Anemic' : 'Not Anemic'}
                          </div>
                          <div className="text-xs text-gray-500">
                            Confidence: {(prediction.predicted_proba * 100).toFixed(1)}%
                          </div>
                          <div className="text-xs text-gray-400">
                            {new Date(prediction.created_at).toLocaleDateString()}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs text-gray-500">
                            Hb: {prediction.input_features.Hemoglobin}
                          </div>
                          <div className="text-xs text-gray-500">
                            MCV: {prediction.input_features.MCV}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  <Link
                    to="/patient/history"
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    View All Results →
                  </Link>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500 mb-4">No test results yet</p>
                  <Link to="/patient/predict" className="btn-primary">
                    Take Your First Test
                  </Link>
                </div>
              )}
            </div>

            {/* Active Prescriptions */}
            <div className="card">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Active Prescriptions</h2>
              {active_prescriptions.length > 0 ? (
                <div className="space-y-4">
                  {active_prescriptions.map((prescription) => (
                    <div key={prescription.id} className="border-l-4 border-green-500 pl-4 py-2">
                      <div className="font-medium text-gray-900">{prescription.title}</div>
                      <div className="text-sm text-gray-600 mt-1">
                        {prescription.medications?.length > 0 && (
                          <div>Medications: {prescription.medications.join(', ')}</div>
                        )}
                      </div>
                      <div className="text-xs text-gray-400 mt-1">
                        Prescribed: {new Date(prescription.prescribed_at).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                  <Link
                    to="/patient/prescriptions"
                    className="text-green-600 hover:text-green-800 text-sm font-medium"
                  >
                    View All Prescriptions →
                  </Link>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">No active prescriptions</p>
                </div>
              )}
            </div>
          </div>

          {/* Health Tips */}
          <div className="card mt-8 bg-yellow-50">
            <h2 className="text-xl font-bold text-yellow-900 mb-4">Health Tips</h2>
            <div className="space-y-2 text-yellow-800">
              <p>• Regular blood tests help monitor your health status</p>
              <p>• Iron-rich foods like spinach, lentils, and lean meat can help prevent anemia</p>
              <p>• Vitamin C helps your body absorb iron better</p>
              <p>• Always consult your doctor before making significant dietary changes</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientDashboard;
