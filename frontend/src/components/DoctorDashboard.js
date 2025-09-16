import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import XAIExplanation from './XAIExplanation';

/**************** Wrapper Router ****************/
const DoctorDashboard = () => (
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
    <Routes>
      <Route path="/" element={<DoctorHome />} />
      <Route path="/patients" element={<PatientList />} />
      <Route path="/patients/:patientId/predictions" element={<PatientPredictions />} />
      <Route path="/patients/:patientId/prescriptions" element={<PatientPrescriptions />} />
    </Routes>
  </div>
);

/**************** Home (overview) ****************/
const DoctorHome = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [stats, setStats] = useState({ patients: 0, predictions: 0 });
  const [recentPatients, setRecentPatients] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { user?.role === 'doctor' ? load() : setLoading(false); }, [user]);

  const load = async () => {
    try {
      const { data } = await api.getPatients();
      const pts = data.patients || [];
      setRecentPatients(pts.slice(0, 5));
      const totalPreds = pts.reduce((s,p)=>s + (p.prediction_count || 0), 0);
      setStats({ patients: pts.length, predictions: totalPreds });
    } catch (e) { console.error('Dash fetch fail', e); } finally { setLoading(false); }
  };

  if (!user) return <Centered msg="Please log in." />;
  if (user.role !== 'doctor') return <Centered msg="Unauthorized." />;
  if (loading) return <Centered msg="Loading dashboard..." />;

  return (
    <div className="space-y-10 pt-4">
      <header className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
        <div>
          <h1 className="heading-xl-plain mb-2">Doctor Dashboard</h1>
          <p className="subtle">Clinical oversight & patient analytics</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button onClick={()=>navigate('/doctor/patients?action=register')} className="btn-primary h-11 px-6">Register Patient</button>
          <button onClick={()=>navigate('/doctor/patients')} className="btn-secondary h-11 px-6">All Patients</button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard label="Total Patients" value={stats.patients} tone="brand" short="P" />
        <StatCard label="Total Predictions" value={stats.predictions} tone="teal" short="A" />
      </div>

      <section className="space-y-4">
        <h2 className="heading">Recent Patients</h2>
        <div className="card">
          {recentPatients.length ? (
            <SimpleTable rows={recentPatients} onPred={id=>navigate(`/doctor/patients/${id}/predictions`)} onPres={id=>navigate(`/doctor/patients/${id}/prescriptions`)} />
          ) : <p className="subtle">No patients registered yet.</p>}
        </div>
      </section>
    </div>
  );
};

/**************** Patient List ****************/
const PatientList = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ patient_name:'', patient_email:'', gender:'', dob:'', password:'' });
  const [error, setError] = useState('');

  useEffect(()=>{ user?.role==='doctor' ? init() : setLoading(false); },[user]);

  const init = async () => {
    const qp = new URLSearchParams(window.location.search);
    if (qp.get('action')==='register') setShowForm(true);
    await loadPatients();
  };

  const loadPatients = async () => {
    try { const { data } = await api.getPatients(); setPatients(data.patients || []); }
    catch(e){ console.error('Patients fetch fail', e);} finally { setLoading(false); }
  };

  const submit = async e => {
    e.preventDefault(); setError('');
    try {
      const res = await api.registerPatient(form);
      setShowForm(false);
      setForm({patient_name:'',patient_email:'',gender:'',dob:'',password:''});
      await loadPatients();
      if (res.data && res.data.temporary_password) {
        alert(`Patient registered! Password: ${res.data.temporary_password}`);
      }
    }
    catch(e){ setError(e.response?.data?.error || 'Registration failed'); }
  };

  const exportPredictions = async id => {
    try {
      const res = await api.exportPredictions(id);
      const blob=new Blob([res.data],{type:'text/csv'});
      const url=URL.createObjectURL(blob);
      const a=document.createElement('a'); a.href=url; a.download=`patient_${id}_predictions.csv`; a.click(); URL.revokeObjectURL(url);
    } catch(e){ console.error('Export failed', e);} };

  if (!user) return <Centered msg="Please log in." />;
  if (user.role !== 'doctor') return <Centered msg="Unauthorized." />;
  if (loading) return <Centered msg="Loading patients..." />;

  return (
    <div className="space-y-10 pt-4">
      <header className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
        <div>
          <h1 className="heading-xl-plain mb-2">Patients</h1>
          <p className="subtle">Manage registrations & clinical data</p>
        </div>
        <button onClick={()=>setShowForm(true)} className="btn-primary h-11 px-6">Register Patient</button>
      </header>

      {showForm && (
        <div className="card">
          <h3 className="heading mb-6">Register New Patient</h3>
          <form className="space-y-5" onSubmit={submit}>
            <div className="grid md:grid-cols-2 gap-5">
              <FormField label="Patient Name"><input type="text" name="patient_name" value={form.patient_name} onChange={e=>setForm({...form,patient_name:e.target.value})} required className="form-input" placeholder="Full name" /></FormField>
              <FormField label="Patient Email"><input type="email" name="patient_email" value={form.patient_email} onChange={e=>setForm({...form,patient_email:e.target.value})} required className="form-input" placeholder="name@example.com" /></FormField>
              <FormField label="Gender"><input type="text" name="gender" value={form.gender} onChange={e=>setForm({...form,gender:e.target.value})} required className="form-input" placeholder="0=Female, 1=Male" /></FormField>
              <FormField label="Date of Birth"><input type="date" name="dob" value={form.dob} onChange={e=>setForm({...form,dob:e.target.value})} required className="form-input" /></FormField>
              <FormField label="Set Password (optional)"><input type="text" name="password" value={form.password} onChange={e=>setForm({...form,password:e.target.value})} className="form-input" placeholder="Leave blank for auto" /></FormField>
            </div>
            <button type="submit" className="btn-primary w-full h-11">Register Patient</button>
            {error && <p className="alert-error mt-2">{error}</p>}
          </form>
        </div>
      )}

      <div className="card">
        {patients.length ? (
          <div className="overflow-x-auto">
            <table className="table-base">
              <thead className="table-head"><tr><Th>Name</Th><Th>Email</Th><Th>Predictions</Th><Th>Registered</Th><Th>Actions</Th></tr></thead>
              <tbody className="divide-y divide-brand-600/10 dark:divide-brand-400/10">
                {patients.map(p => (
                  <tr key={p.id} className="hover:bg-brand-50/40 dark:hover:bg-brand-700/20 transition-colors">
                    <Td>{p.name}</Td>
                    <Td>{p.email}</Td>
                    <Td>{p.prediction_count || 0}</Td>
                    <Td>{p.created_at ? new Date(p.created_at).toLocaleDateString() : '-'}</Td>
                    <Td>
                      <div className="flex flex-wrap gap-3 text-xs font-medium">
                        <button onClick={()=>navigate(`/doctor/patients/${p.id}/predictions`)} className="text-brand-600 hover:text-brand-800 dark:text-brand-300 dark:hover:text-brand-200">Predictions</button>
                        <button onClick={()=>navigate(`/doctor/patients/${p.id}/prescriptions`)} className="text-teal-600 hover:text-teal-800 dark:text-teal-300 dark:hover:text-teal-200">Prescriptions</button>
                        <button onClick={()=>exportPredictions(p.id)} className="text-accent-600 hover:text-accent-700 dark:text-accent-300 dark:hover:text-accent-200">Export</button>
                      </div>
                    </Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : <p className="subtle text-center py-8">No patients registered yet.</p>}
      </div>
    </div>
  );
};

/**************** Patient Predictions ****************/
const PatientPredictions = () => {
  const { patientId } = useParams();
  const { user } = useAuth();
  const [latestPrediction, setLatestPrediction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => { if (user?.role === 'doctor') { loadPredictions(); } else { setLoading(false); } }, [user, patientId]);

  const loadPredictions = async () => {
    setLoading(true); setError('');
    try {
      const { data } = await api.getPatientPredictions(patientId);
      const predictions = data.predictions || [];
      setLatestPrediction(predictions.length ? predictions[0] : null);
    } catch (e) { setError('Failed to fetch predictions'); } finally { setLoading(false); }
  };

  if (!user) return <Centered msg="Please log in." />;
  if (user.role !== 'doctor') return <Centered msg="Unauthorized." />;
  if (loading) return <Centered msg="Loading predictions..." />;
  if (error) return <Centered msg={error} />;

  return (
    <div className="space-y-8 pt-4 max-w-3xl mx-auto w-full">
      <h2 className="heading-xl-plain">Latest Prediction for Patient #{patientId}</h2>
      {latestPrediction ? (
        <div className="card space-y-5">
          <Meta label="Date" value={latestPrediction.created_at ? new Date(latestPrediction.created_at).toLocaleString() : '-'} />
          <Meta label="Result" value={<span className={latestPrediction.result === 'Anaemia' ? 'text-accent-600 font-semibold' : 'text-teal-600 font-semibold'}>{latestPrediction.result}</span>} />
          {latestPrediction.confidence && <Meta label="Confidence" value={`${latestPrediction.confidence}%`} />}
          {latestPrediction.risk_level && <Meta label="Risk Level" value={latestPrediction.risk_level} />}
          {latestPrediction.clinical_summary && <Meta label="Clinical Summary" value={latestPrediction.clinical_summary} />}
          {latestPrediction.explanation && (
            <div className="pt-4 border-t border-brand-600/10 dark:border-brand-400/10">
              <XAIExplanation explanation={latestPrediction.explanation} />
            </div>
          )}
        </div>
      ) : <p className="subtle">No predictions found for this patient.</p>}
    </div>
  );
};

/**************** Patient Prescriptions ****************/
const PatientPrescriptions = () => {
  const { patientId } = useParams();
  const { user } = useAuth();
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', medications: '', notes: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { if (user?.role === 'doctor') { loadPrescriptions(); } else { setLoading(false); } }, [user, patientId]);

  const loadPrescriptions = async () => {
    setLoading(true); setError('');
    try {
      const { data } = await api.getPatientPrescriptions(patientId);
      setPrescriptions(data.prescriptions || []);
    } catch (e) { setError('Failed to fetch prescriptions'); } finally { setLoading(false); }
  };

  const submitPrescription = async e => {
    e.preventDefault(); setSubmitting(true); setError('');
    try {
      await api.addOrUpdatePrescription(patientId, form);
      setForm({ title: '', medications: '', notes: '' });
      setShowForm(false);
      await loadPrescriptions();
    } catch (e) { setError('Failed to submit prescription: ' + (e.response?.data?.error || 'Unknown error')); }
    finally { setSubmitting(false); }
  };

  if (!user) return <Centered msg="Please log in." />;
  if (user.role !== 'doctor') return <Centered msg="Unauthorized." />;
  if (loading) return <Centered msg="Loading prescriptions..." />;
  if (error) return <Centered msg={error} />;

  return (
    <div className="space-y-8 pt-4 max-w-4xl mx-auto w-full">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h2 className="heading-xl-plain">Prescriptions for Patient #{patientId}</h2>
        <button className="btn-primary h-11" onClick={()=>setShowForm(!showForm)}>
          {showForm ? 'Cancel' : 'Add / Update'}
        </button>
      </div>
      {showForm && (
        <div className="card">
          <form onSubmit={submitPrescription} className="space-y-5">
            <FormField label="Title *"><input type="text" value={form.title} onChange={e=>setForm({...form, title: e.target.value})} required className="form-input" placeholder="Prescription title" /></FormField>
            <FormField label="Medications"><input type="text" value={form.medications} onChange={e=>setForm({...form, medications: e.target.value})} className="form-input" placeholder="Enter medications" /></FormField>
            <FormField label="Notes"><textarea value={form.notes} onChange={e=>setForm({...form, notes: e.target.value})} className="form-input min-h-[100px]" placeholder="Additional notes" /></FormField>
            <button type="submit" className="btn-primary w-full h-11" disabled={submitting}>{submitting ? 'Saving...' : 'Save Prescription'}</button>
          </form>
        </div>
      )}
      <div className="card">
        {prescriptions.length ? (
          <table className="table-base">
            <thead className="table-head"><tr><Th>Date</Th><Th>Title</Th><Th>Medications</Th><Th>Notes</Th></tr></thead>
            <tbody className="divide-y divide-brand-600/10 dark:divide-brand-400/10">
              {prescriptions.map(pres => (
                <tr key={pres.id} className="hover:bg-brand-50/40 dark:hover:bg-brand-700/20 transition-colors">
                  <Td>{pres.created_at ? new Date(pres.created_at).toLocaleString() : '-'}</Td>
                  <Td>{pres.title}</Td>
                  <Td>{pres.medications}</Td>
                  <Td>{pres.notes}</Td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : <p className="subtle">No prescriptions found for this patient.</p>}
      </div>
    </div>
  );
};

/**************** Helpers ****************/
const Centered = ({ msg }) => (<div className="flex justify-center items-center h-64"><div className="text-sm text-gray-500 dark:text-gray-400">{msg}</div></div>);
const StatCard = ({ label, value, short }) => (
  <div className="card flex items-center gap-4">
    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center text-white font-bold">{short}</div>
    <div>
      <div className="text-xs font-semibold tracking-wider uppercase text-gray-500 dark:text-gray-400">{label}</div>
      <div className="text-2xl font-bold text-brand-800 dark:text-brand-100">{value}</div>
    </div>
  </div>
);
const Th = ({ children }) => <th className="table-head-cell">{children}</th>;
const Td = ({ children }) => <td className="table-cell">{children}</td>;
const SimpleTable = ({ rows, onPred, onPres }) => (
  <div className="overflow-x-auto">
    <table className="table-base">
      <thead className="table-head"><tr><Th>Name</Th><Th>Email</Th><Th>Predictions</Th><Th>Actions</Th></tr></thead>
      <tbody className="divide-y divide-brand-600/10 dark:divide-brand-400/10">
        {rows.map(r => (
          <tr key={r.id} className="hover:bg-brand-50/40 dark:hover:bg-brand-700/20 transition-colors">
            <Td>{r.name}</Td><Td>{r.email}</Td><Td>{r.prediction_count || 0}</Td>
            <Td>
              <div className="flex flex-wrap gap-3 text-xs font-medium">
                <button onClick={()=>onPred(r.id)} className="text-brand-600 hover:text-brand-800 dark:text-brand-300 dark:hover:text-brand-200">Predictions</button>
                <button onClick={()=>onPres(r.id)} className="text-teal-600 hover:text-teal-800 dark:text-teal-300 dark:hover:text-teal-200">Prescriptions</button>
              </div>
            </Td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);
const FormField = ({ label, children }) => (<label className="flex flex-col gap-1"><span className="form-label normal-case">{label}</span>{children}</label>);
const Meta = ({ label, value }) => (
  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 p-3 rounded-lg bg-brand-50/60 dark:bg-brand-700/20 border border-brand-600/10 dark:border-brand-400/10">
    <span className="text-xs font-semibold tracking-wider uppercase text-brand-600 dark:text-brand-300">{label}</span>
    <span className="text-sm text-brand-800 dark:text-brand-100 max-w-xl">{value}</span>
  </div>
);

export default DoctorDashboard;
