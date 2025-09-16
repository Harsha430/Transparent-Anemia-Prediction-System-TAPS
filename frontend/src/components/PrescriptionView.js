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

  useEffect(() => { if (user?.id) { fetchPrescriptions(); } }, [user?.id, fetchPrescriptions]);

  const isExpired = (expiryDate) => expiryDate ? new Date(expiryDate) < new Date() : false;
  const statusBadge = (prescription) => {
    const expired = isExpired(prescription.expires_at);
    return (
      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold tracking-wide uppercase ${expired ? 'bg-accent-100 text-accent-700 dark:bg-accent-700/30 dark:text-accent-200' : 'bg-teal-100 text-teal-700 dark:bg-teal-600/30 dark:text-teal-100'}`}>
        {expired ? 'Expired' : 'Active'}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 rounded-full border-4 border-brand-200 border-t-brand-600 animate-spin" />
          <p className="text-sm text-gray-500">Loading prescriptions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
      <header className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 pt-2">
        <div>
          <h1 className="heading-xl mb-2">My Prescriptions</h1>
          <p className="subtle">Medication guidance prescribed by your doctor</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button onClick={() => navigate('/patient')} className="btn-secondary h-11 px-6">Dashboard</button>
          <button onClick={() => navigate('/patient/predict')} className="btn-primary h-11 px-6">Run Test</button>
        </div>
      </header>

      {error && <div className="alert-error">{error}</div>}

      {prescriptions.length > 0 ? (
        <div className="space-y-6">
          {prescriptions.map((p) => (
            <div key={p.id} className="card space-y-5">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                <div>
                  <h3 className="text-lg font-semibold text-brand-800 dark:text-brand-100 leading-tight">{p.title}</h3>
                  <div className="mt-1 flex flex-wrap gap-3 text-xs text-gray-500 dark:text-gray-400">
                    <span>Prescribed {new Date(p.prescribed_at).toLocaleDateString()}</span>
                    {p.expires_at && <span>Expires {new Date(p.expires_at).toLocaleDateString()}</span>}
                    <span>ID: {p.id}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">{statusBadge(p)}</div>
              </div>

              {p.medications && (
                <div>
                  <h4 className="text-xs font-semibold tracking-wide uppercase text-brand-600 dark:text-brand-300 mb-2">Medications</h4>
                  <div className="flex flex-wrap gap-2">
                    {Array.isArray(p.medications) ? p.medications : (p.medications || '').split(',')
                      .map(m => m.trim())
                      .filter(Boolean)
                      .map((m,i)=>(
                        <span key={i} className="badge bg-brand-100/70 dark:bg-brand-700/40 text-brand-700 dark:text-brand-100">{m}</span>
                      ))}
                  </div>
                </div>
              )}

              {p.notes && (
                <div>
                  <h4 className="text-xs font-semibold tracking-wide uppercase text-brand-600 dark:text-brand-300 mb-2">Instructions</h4>
                  <div className="rounded-lg bg-brand-50/60 dark:bg-brand-700/20 border border-brand-600/10 dark:border-brand-400/10 p-4 text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                    {p.notes}
                  </div>
                </div>
              )}

              <div className="pt-2 border-t border-brand-600/10 dark:border-brand-400/10 flex flex-wrap gap-3 text-[11px] tracking-wide uppercase text-gray-500 dark:text-gray-400">
                <span>Last Updated {new Date(p.created_at).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card text-center py-16 space-y-6">
          <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center text-white shadow-soft text-xl font-bold">Rx</div>
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-brand-800 dark:text-brand-100">No Prescriptions Yet</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md mx-auto">When your doctor adds a prescription, it will appear here with medication details and instructions.</p>
          </div>
          <div className="flex flex-wrap gap-4 justify-center">
            <button onClick={() => navigate('/patient')} className="btn-primary h-11 px-6">Back to Dashboard</button>
            <button onClick={() => navigate('/patient/predict')} className="btn-secondary h-11 px-6">Run a Test</button>
          </div>
        </div>
      )}

      <section className="card surface-accent">
        <h3 className="heading mb-4">Safe Medication Guidance</h3>
        <ul className="grid md:grid-cols-2 gap-3 text-sm text-brand-800 dark:text-brand-100/90">
          <Tip>Follow dosage timing precisely.</Tip>
          <Tip>Report side effects to your doctor promptly.</Tip>
          <Tip>Don't discontinue without medical advice.</Tip>
          <Tip>Store medication out of children's reach.</Tip>
          <Tip>Track expiry dates and discard expired items.</Tip>
          <Tip>Avoid doubling doses if you miss one.</Tip>
        </ul>
      </section>
    </div>
  );
};

const Tip = ({ children }) => (
  <li className="flex items-start gap-2"><span className="mt-1 text-brand-500">•</span><span>{children}</span></li>
);

export default PrescriptionView;
