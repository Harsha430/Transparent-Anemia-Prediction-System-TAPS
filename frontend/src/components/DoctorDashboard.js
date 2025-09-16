import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';


/**************** Wrapper Router ****************/
const DoctorDashboard = () => (
  <div className="min-h-screen bg-gray-50">
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
    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div className="px-4 py-6 sm:px-0">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Doctor Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <StatCard label="Total Patients" value={stats.patients} color="blue" short="P" />
          <StatCard label="Total Predictions" value={stats.predictions} color="green" short="A" />
        </div>
        <div className="card mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
          <div className="flex flex-wrap gap-4">
            <button onClick={()=>navigate('/doctor/patients?action=register')} className="btn-primary">Register New Patient</button>
            <button onClick={()=>navigate('/doctor/patients')} className="btn-secondary">View All Patients</button>
          </div>
        </div>
        <div className="card">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Patients</h2>
          {recentPatients.length ? (
            <SimpleTable rows={recentPatients} onPred={id=>navigate(`/doctor/patients/${id}/predictions`)} onPres={id=>navigate(`/doctor/patients/${id}/prescriptions`)} />
          ) : <p className="text-gray-500">No patients registered yet.</p>}
        </div>
      </div>
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
  const [form, setForm] = useState({ patient_name:'', patient_email:'', gender:'', dob:'' });
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
    try { await api.registerPatient(form); setShowForm(false); setForm({patient_name:'',patient_email:'',gender:'',dob:''}); await loadPatients(); }
    catch(e){ setError(e.response?.data?.error || 'Registration failed'); }
  };

  const exportPredictions = async id => {
    try { const res = await api.exportPredictions(id); const blob=new Blob([res.data],{type:'text/csv'}); const url=URL.createObjectURL(blob); const a=document.createElement('a'); a.href=url; a.download=`patient_${id}_predictions.csv`; a.click(); URL.revokeObjectURL(url);} catch(e){ console.error('Export failed', e);} };

  if (!user) return <Centered msg="Please log in." />;
  if (user.role !== 'doctor') return <Centered msg="Unauthorized." />;
  if (loading) return <Centered msg="Loading patients..." />;

  return (
    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div className="px-4 py-6 sm:px-0">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Patients</h1>
          <button onClick={()=>setShowForm(true)} className="btn-primary">Register New Patient</button>
        </div>
        {showForm && (
          <div className="card mb-8">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Register New Patient</h3>
            <form onSubmit={submit} className="space-y-4">
              <Input label="Patient Name" value={form.patient_name} onChange={v=>setForm({...form,patient_name:v})} required />
              <Input label="Email" type="email" value={form.patient_email} onChange={v=>setForm({...form,patient_email:v})} required />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                <select className="form-input" value={form.gender} onChange={e=>setForm({...form,gender:e.target.value})}>
                  <option value="">Select Gender</option>
                  <option value="0">Female</option>
                  <option value="1">Male</option>
                </select>
              </div>
              <Input label="Date of Birth (Optional)" type="date" value={form.dob} onChange={v=>setForm({...form,dob:v})} />
              {error && <div className="alert-error">{error}</div>}
              <div className="flex gap-4 pt-2">
                <button type="submit" className="btn-primary">Register</button>
                <button type="button" onClick={()=>setShowForm(false)} className="btn-secondary">Cancel</button>
              </div>
            </form>
          </div>
        )}
        <div className="card">
          {patients.length ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50"><tr><Th>Name</Th><Th>Email</Th><Th>Predictions</Th><Th>Registered</Th><Th>Actions</Th></tr></thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {patients.map(p => (
                    <tr key={p.id}>
                      <Td>{p.name}</Td>
                      <Td>{p.email}</Td>
                      <Td>{p.prediction_count || 0}</Td>
                      <Td>{p.created_at ? new Date(p.created_at).toLocaleDateString() : '-'}</Td>
                      <Td>
                        <button onClick={()=>navigate(`/doctor/patients/${p.id}/predictions`)} className="text-blue-600 hover:text-blue-900 mr-3">Predictions</button>
                        <button onClick={()=>navigate(`/doctor/patients/${p.id}/prescriptions`)} className="text-green-600 hover:text-green-900 mr-3">Prescriptions</button>
                        <button onClick={()=>exportPredictions(p.id)} className="text-purple-600 hover:text-purple-900">Export</button>
                      </Td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : <p className="text-gray-500 text-center py-8">No patients registered yet.</p>}
        </div>
      </div>
    </div>
  );
};

/**************** Placeholders ****************/
const PatientPredictions = () => { const { patientId } = useParams(); return <div className="p-6">Predictions for patient #{patientId}</div>; };
const PatientPrescriptions = () => { const { patientId } = useParams(); return <div className="p-6">Prescriptions for patient #{patientId}</div>; };

/**************** Helpers ****************/
const Centered = ({ msg }) => (<div className="flex justify-center items-center h-64"><div className="text-lg">{msg}</div></div>);
const StatCard = ({ label, value, color, short }) => {
  const colors = { blue:'bg-blue-500', green:'bg-green-500', red:'bg-red-500', purple:'bg-purple-500' };
  const circle = colors[color] || 'bg-gray-400';
  return (
    <div className="card">
      <div className="flex items-center">
        <div className="flex-shrink-0">
          <div className={`w-8 h-8 ${circle} rounded-full flex items-center justify-center`}><span className="text-white font-bold">{short}</span></div>
        </div>
        <div className="ml-4">
          <div className="text-sm font-medium text-gray-500">{label}</div>
          <div className="text-2xl font-bold text-gray-900">{value}</div>
        </div>
      </div>
    </div>
  );
};
const Th = ({ children }) => <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{children}</th>;
const Td = ({ children }) => <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{children}</td>;
const Input = ({ label, type='text', value, onChange, required=false }) => (<div><label className="block text-sm font-medium text-gray-700 mb-1">{label}</label><input type={type} required={required} className="form-input" value={value} onChange={e=>onChange(e.target.value)} /></div>);
const SimpleTable = ({ rows, onPred, onPres }) => (
  <div className="overflow-x-auto">
    <table className="min-w-full divide-y divide-gray-200">
      <thead className="bg-gray-50"><tr><Th>Name</Th><Th>Email</Th><Th>Predictions</Th><Th>Actions</Th></tr></thead>
      <tbody className="bg-white divide-y divide-gray-200">
        {rows.map(r => (
          <tr key={r.id}>
            <Td>{r.name}</Td><Td>{r.email}</Td><Td>{r.prediction_count || 0}</Td>
            <Td>
              <button onClick={()=>onPred(r.id)} className="text-blue-600 hover:text-blue-900 mr-3">Predictions</button>
              <button onClick={()=>onPres(r.id)} className="text-green-600 hover:text-green-900">Prescriptions</button>
            </Td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export default DoctorDashboard;
