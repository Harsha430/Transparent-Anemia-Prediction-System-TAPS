import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const PrescriptionView = () => {
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useAuth();
  const navigate = useNavigate();

  const fetchPrescriptions = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.getPrescriptions(user.id);
      setPrescriptions(response.data.prescriptions);
    } catch (error) {
      console.error('Error fetching prescriptions:', error);
      if (error.response?.status !== 401) {
        setError('Failed to load prescriptions');
      }
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    if (user?.id) {
      fetchPrescriptions();
    }
  }, [user?.id, fetchPrescriptions]);

  const isExpired = (expiryDate) => {
    if (!expiryDate) return false;
    return new Date(expiryDate) < new Date();
  };

  const getStatusBadge = (prescription) => {
    if (isExpired(prescription.expires_at)) {
      return <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">Expired</span>;
    }
    return <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">Active</span>;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <div className="text-lg">Loading prescriptions...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">My Prescriptions</h1>

          {error && (
            <div className="alert-error mb-6">
              {error}
            </div>
          )}

          {prescriptions.length > 0 ? (
            <div className="space-y-6">
              {prescriptions.map((prescription) => (
                <div key={prescription.id} className="card">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">
                        {prescription.title}
                      </h3>
                      <p className="text-sm text-gray-500">
                        Prescribed on: {new Date(prescription.prescribed_at).toLocaleDateString()}
                      </p>
                      {prescription.expires_at && (
                        <p className="text-sm text-gray-500">
                          Expires: {new Date(prescription.expires_at).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                    <div className="flex flex-col items-end space-y-2">
                      {getStatusBadge(prescription)}
                    </div>
                  </div>

                  {prescription.medications && prescription.medications.length > 0 && (
                    <div className="mb-4">
                      <h4 className="font-medium text-gray-900 mb-2">Medications:</h4>
                      <div className="bg-blue-50 rounded-lg p-4">
                        <ul className="list-disc list-inside space-y-1">
                          {prescription.medications.map((medication, index) => (
                            <li key={index} className="text-blue-800">{medication}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}

                  {prescription.notes && (
                    <div className="mb-4">
                      <h4 className="font-medium text-gray-900 mb-2">Instructions:</h4>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <p className="text-gray-700 whitespace-pre-wrap">{prescription.notes}</p>
                      </div>
                    </div>
                  )}

                  <div className="border-t pt-4">
                    <div className="flex justify-between items-center text-sm text-gray-500">
                      <span>Prescription ID: {prescription.id}</span>
                      <span>Last updated: {new Date(prescription.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="card text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Prescriptions Yet</h3>
              <p className="text-gray-500 mb-6">
                You don't have any prescriptions from your doctor yet. When your doctor creates a prescription for you, it will appear here.
              </p>
              <button
                onClick={() => navigate('/patient')}
                className="btn-primary"
              >
                Back to Dashboard
              </button>
            </div>
          )}

          {/* Health Information */}
          <div className="mt-8 card bg-blue-50">
            <h3 className="text-lg font-semibold text-blue-900 mb-4">Important Information</h3>
            <div className="space-y-2 text-blue-800 text-sm">
              <p>• Always follow your doctor's instructions when taking medications</p>
              <p>• Take medications at the prescribed times and doses</p>
              <p>• Contact your doctor if you experience any side effects</p>
              <p>• Don't stop taking medications without consulting your doctor</p>
              <p>• Keep all medications out of reach of children</p>
              <p>• Check expiration dates and dispose of expired medications properly</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrescriptionView;
