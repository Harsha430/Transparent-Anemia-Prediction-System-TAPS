import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import XAIExplanation from './XAIExplanation';

const PatientDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => { fetchDashboardData(); }, []);

  const fetchDashboardData = async () => {
    try { const response = await api.getPatientDashboard(); setDashboardData(response.data); }
    catch (error) { console.error('Error fetching dashboard data:', error); }
    finally { setLoading(false); }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 rounded-full border-4 border-brand-200 border-t-brand-600 animate-spin" />
          <p className="text-sm text-gray-500">Loading personalized insights...</p>
        </div>
      </div>
    );
  }

  const { recent_predictions = [], active_prescriptions = [], total_predictions = 0, doctor } = dashboardData || {};
  const latest = recent_predictions[0];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
      <header className="flex flex-col gap-4 pt-2">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
          <div>
            <h1 className="heading-xl-plain mb-2">Welcome back, {user?.name}</h1>
            <p className="subtle">Your personalised anaemia monitoring & insights hub</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link to="/patient/predict" className="btn-primary h-11 px-6">Run New Test</Link>
            <Link to="/patient/prescriptions" className="btn-secondary h-11 px-6">View Prescriptions</Link>
          </div>
        </div>
      </header>

      {/* Doctor Info / Relationship */}
      {doctor && (
        <div className="card surface-accent flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <p className="text-xs font-semibold tracking-wider uppercase text-brand-600 dark:text-brand-300 mb-1">Primary Care</p>
            <h2 className="text-lg font-semibold text-brand-800 dark:text-brand-200">Dr. {doctor.name}</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">{doctor.hospital}</p>
          </div>
          <div className="flex gap-4">
            <div className="badge">Monitoring Active</div>
            <div className="badge-accent">Trusted Link</div>
          </div>
        </div>
      )}

      {/* Latest AI Explanation */}
      {latest && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="heading">Latest AI Explanation</h2>
            <Link to="/patient/predict" className="btn-outline h-9">New Test</Link>
          </div>
          <XAIExplanation explanation={latest?.explanations} />
        </section>
      )}

      {/* Stats Grid */}
      <section>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard label="Total Tests" value={total_predictions} tone="brand" icon={
            <CircleIcon className="from-brand-500 to-brand-700" letter="T" />
          } />
          <StatCard label="Recent Tests" value={recent_predictions.length} tone="teal" icon={
            <CircleIcon className="from-teal-400 to-teal-600" letter="R" />
          } />
          <StatCard label="Prescriptions" value={active_prescriptions.length} tone="accent" icon={
            <CircleIcon className="from-accent-400 to-accent-600" letter="P" />
          } />
        </div>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Predictions */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="heading">Recent Test Results</h2>
            <Link to="/patient/history" className="btn-ghost h-9">View All →</Link>
          </div>
          <div className="card">
            {recent_predictions.length > 0 ? (
              <ul className="space-y-4">
                {recent_predictions.map(prediction => (
                  <li key={prediction.id} className="p-4 rounded-lg border border-brand-600/10 hover:border-brand-600/30 transition-colors bg-white/70 dark:bg-slate-950/40">
                    <div className="flex justify-between items-start gap-6">
                      <div className="flex-1">
                        <div className={`text-sm font-semibold ${prediction.predicted_label === 1 ? 'text-accent-600' : 'text-teal-600'}`}>
                          {prediction.predicted_label === 1 ? 'Anemic' : 'Not Anemic'}
                        </div>
                        <div className="flex gap-4 text-xs mt-1 text-gray-500 dark:text-gray-400">
                          <span>Confidence: {(prediction.predicted_proba * 100).toFixed(1)}%</span>
                          <span>{new Date(prediction.created_at).toLocaleDateString()}</span>
                        </div>
                        {prediction.input_features && (
                          <div className="mt-2 flex flex-wrap gap-2">
                            {['Hemoglobin','MCV','MCH','MCHC'].filter(k => prediction.input_features[k]!==undefined).map(k => (
                              <span key={k} className="badge bg-brand-100/70 dark:bg-brand-700/40 capitalize">{k}: {prediction.input_features[k]}</span>
                            ))}
                          </div>
                        )}
                      </div>
                      <RiskPill probability={prediction.predicted_proba} />
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500 mb-4">No test results yet</p>
                <Link to="/patient/predict" className="btn-primary">Take Your First Test</Link>
              </div>
            )}
          </div>
        </div>

        {/* Active Prescriptions */}
        <div className="space-y-4">
          <h2 className="heading">Active Prescriptions</h2>
          <div className="card">
            {active_prescriptions.length > 0 ? (
              <ul className="space-y-4">
                {active_prescriptions.map(prescription => (
                  <li key={prescription.id} className="p-4 rounded-lg border border-brand-600/10 hover:border-brand-600/30 transition-colors bg-white/70 dark:bg-slate-950/40">
                    <div className="font-semibold text-brand-800 dark:text-brand-100 mb-1">{prescription.title}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-300">
                      Medications: {Array.isArray(prescription.medications) ? prescription.medications.join(', ') : (prescription.medications || 'None')}
                    </div>
                    <div className="text-xs text-gray-400 mt-2">Prescribed: {new Date(prescription.prescribed_at).toLocaleDateString()}</div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-center py-10">
                <p className="text-gray-500">No active prescriptions</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Health Tips */}
      <section className="card surface-accent">
        <h2 className="heading mb-4">Health Tips</h2>
        <div className="grid md:grid-cols-2 gap-4 text-sm text-brand-800 dark:text-brand-100/90">
          <Tip>Regular blood tests help monitor your health status.</Tip>
          <Tip>Iron-rich foods like spinach, lentils, and lean meat can help prevent anemia.</Tip>
          <Tip>Vitamin C helps your body absorb iron better.</Tip>
          <Tip>Always consult your doctor before making significant dietary changes.</Tip>
        </div>
      </section>
    </div>
  );
};

const Tip = ({ children }) => (
  <div className="flex items-start gap-2">
    <span className="mt-1 text-brand-500">•</span>
    <span>{children}</span>
  </div>
);

const CircleIcon = ({ letter, className }) => (
  <div className={`w-10 h-10 rounded-full flex items-center justify-center bg-gradient-to-br ${className} text-white font-bold shadow-soft`}>
    {letter}
  </div>
);

const StatCard = ({ label, value, icon }) => (
  <div className="card flex items-center gap-4">
    {icon}
    <div>
      <div className="text-xs font-semibold tracking-wider uppercase text-gray-500 dark:text-gray-400">{label}</div>
      <div className="text-2xl font-bold text-brand-800 dark:text-brand-100">{value}</div>
    </div>
  </div>
);

const RiskPill = ({ probability }) => {
  const p = probability || 0;
  let color = 'bg-teal-100 text-teal-700';
  let label = 'Low Risk';
  if (p > 0.7) { color = 'bg-accent-100 text-accent-700'; label = 'High Risk'; }
  else if (p > 0.3) { color = 'bg-yellow-100 text-yellow-700'; label = 'Moderate'; }
  return <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${color}`}>{label}</span>;
};

export default PatientDashboard;
