import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import XAIExplanation from './XAIExplanation';

const PredictionForm = () => {
  const [formData, setFormData] = useState({ Gender: '', Hemoglobin: '', MCH: '', MCHC: '', MCV: '' });
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [inputMethod, setInputMethod] = useState('form');

  const handleInputChange = (e) => { setFormData({ ...formData, [e.target.name]: e.target.value }); };
  const handleFileChange = (e) => { const f = e.target.files[0]; if (f && f.type === 'text/csv') { setFile(f); setError(''); } else { setError('Please select a valid CSV file'); setFile(null); } };

  const validateForm = () => {
    const required = ['Gender','Hemoglobin','MCH','MCHC','MCV'];
    for (let f of required) { if (!formData[f]) { setError(`${f} is required`); return false; } }
    const Hemoglobin = parseFloat(formData.Hemoglobin); if (Hemoglobin < 3 || Hemoglobin > 25) return setRangeErr('Hemoglobin must be between 3.0 and 25.0 g/dL');
    const MCH = parseFloat(formData.MCH); if (MCH < 10 || MCH > 50) return setRangeErr('MCH must be between 10.0 and 50.0 pg');
    const MCHC = parseFloat(formData.MCHC); if (MCHC < 20 || MCHC > 45) return setRangeErr('MCHC must be between 20.0 and 45.0 g/dL');
    const MCV = parseFloat(formData.MCV); if (MCV < 50 || MCV > 130) return setRangeErr('MCV must be between 50.0 and 130.0 fL');
    return true;
  };
  const setRangeErr = (msg) => { setError(msg); return false; };

  const handleFormSubmit = async (e) => {
    e.preventDefault(); setLoading(true); setError(''); setResult(null);
    if (inputMethod === 'form') {
      if (!validateForm()) { setLoading(false); return; }
      try {
        const payload = { Gender: parseInt(formData.Gender), Hemoglobin: parseFloat(formData.Hemoglobin), MCH: parseFloat(formData.MCH), MCHC: parseFloat(formData.MCHC), MCV: parseFloat(formData.MCV) };
        const response = await api.makePrediction(payload); setResult(response.data);
      } catch (err) { setError(err.response?.data?.error || 'Prediction failed'); }
    } else {
      if (!file) { setError('Please select a CSV file'); setLoading(false); return; }
      try { const response = await api.makePredictionWithFile(file); setResult(response.data); }
      catch (err) { setError(err.response?.data?.error || 'Prediction failed'); }
    }
    setLoading(false);
  };

  const resetForm = () => { setFormData({ Gender: '', Hemoglobin: '', MCH: '', MCHC: '', MCV: '' }); setFile(null); setResult(null); setError(''); };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
      <header className="pt-2">
        <h1 className="heading-xl mb-2">Anemia Prediction</h1>
        <p className="subtle">AI-assisted anemia risk assessment with explainability</p>
      </header>

      {!result ? (
        <div className="card space-y-8">
          {/* Input Method */}
          <div>
            <p className="form-label normal-case mb-2">Input Method</p>
            <div className="flex flex-wrap gap-4">
              <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-brand-700 dark:text-brand-200">
                <input type="radio" value="form" checked={inputMethod==='form'} onChange={(e)=>setInputMethod(e.target.value)} className="text-brand-600 focus:ring-brand-500" /> Manual Entry
              </label>
              <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-brand-700 dark:text-brand-200">
                <input type="radio" value="file" checked={inputMethod==='file'} onChange={(e)=>setInputMethod(e.target.value)} className="text-brand-600 focus:ring-brand-500" /> Upload CSV File
              </label>
            </div>
          </div>

          <form onSubmit={handleFormSubmit} className="space-y-8">
            {inputMethod === 'form' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Field label="Gender *">
                  <select name="Gender" value={formData.Gender} onChange={handleInputChange} required className="form-input">
                    <option value="">Select Gender</option>
                    <option value="0">Female</option>
                    <option value="1">Male</option>
                  </select>
                  <Hint>0 = Female, 1 = Male</Hint>
                </Field>
                <Field label="Hemoglobin (g/dL) *">
                  <input type="number" step="0.1" name="Hemoglobin" value={formData.Hemoglobin} onChange={handleInputChange} required className="form-input" placeholder="12.5" />
                  <Hint>Normal: 12-15.5 (F), 13.5-17.5 (M)</Hint>
                </Field>
                <Field label="MCH (pg) *">
                  <input type="number" step="0.1" name="MCH" value={formData.MCH} onChange={handleInputChange} required className="form-input" placeholder="28.0" />
                  <Hint>Normal: 27-32 pg</Hint>
                </Field>
                <Field label="MCHC (g/dL) *">
                  <input type="number" step="0.1" name="MCHC" value={formData.MCHC} onChange={handleInputChange} required className="form-input" placeholder="33.5" />
                  <Hint>Normal: 32-36 g/dL</Hint>
                </Field>
                <Field label="MCV (fL) *" wide>
                  <input type="number" step="0.1" name="MCV" value={formData.MCV} onChange={handleInputChange} required className="form-input" placeholder="85.0" />
                  <Hint>Normal: 80-100 fL</Hint>
                </Field>
              </div>
            ) : (
              <div className="space-y-3">
                <Field label="Upload CSV File *">
                  <input type="file" accept=".csv" onChange={handleFileChange} className="form-input py-1.5" />
                  <Hint>Columns: Gender,Hemoglobin,MCH,MCHC,MCV (single row)</Hint>
                </Field>
                <div className="p-4 rounded-md bg-brand-50 dark:bg-brand-700/20 border border-brand-600/10 dark:border-brand-400/10 text-xs font-mono text-brand-700 dark:text-brand-200">
                  Gender,Hemoglobin,MCH,MCHC,MCV<br/>1,10.5,25.0,30.0,75.0
                </div>
              </div>
            )}

            {error && <div className="alert-error">{error}</div>}

            <div className="flex flex-wrap gap-4">
              <button type="submit" disabled={loading} className="btn-primary h-11 px-8">{loading ? 'Analyzing...' : 'Run Prediction'}</button>
              <button type="button" onClick={resetForm} className="btn-secondary h-11 px-6">Clear</button>
            </div>
          </form>
        </div>
      ) : (
        <XAIPredictionResult result={result} resetForm={resetForm} />
      )}
    </div>
  );
};

// Field helpers
const Field = ({ label, children, wide }) => (
  <div className={`${wide ? 'md:col-span-2' : ''}`}>
    <label className="form-label normal-case">{label}</label>
    {children}
  </div>
);
const Hint = ({ children }) => <p className="form-hint">{children}</p>;

// Prediction Result
const XAIPredictionResult = ({ result, resetForm }) => {
  const navigate = useNavigate();
  const getRiskLevel = (p) => { if (p>0.7) return { level: 'High', color: 'text-accent-600', bg: 'bg-accent-100/60' }; if (p>0.3) return { level: 'Moderate', color: 'text-yellow-600', bg:'bg-yellow-100/60' }; return { level:'Low', color:'text-teal-600', bg:'bg-teal-100/60' }; };
  const risk = getRiskLevel(result.predicted_proba);
  return (
    <div className="space-y-10">
      <div className="card space-y-6">
        <h2 className="heading">AI Prediction Result</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className={`p-5 rounded-xl ${risk.bg} border border-brand-600/10 flex flex-col items-center justify-center text-center shadow-soft`}>
            <div className={`text-3xl font-bold ${risk.color}`}>{result.predicted_label === 1 ? 'Anemic' : 'Not Anemic'}</div>
            <div className="text-xs mt-1 text-gray-600 dark:text-gray-300">Confidence {(result.predicted_proba*100).toFixed(1)}%</div>
            <div className={`text-xs font-semibold mt-2 ${risk.color} tracking-wide uppercase`}>Risk: {risk.level}</div>
          </div>
          <div className="md:col-span-2 space-y-3">
            <h3 className="text-sm font-semibold tracking-wide uppercase text-brand-600 dark:text-brand-300">Clinical Summary</h3>
            {result.explanations?.clinical_interpretation && (
              <div className="text-sm leading-relaxed text-gray-700 dark:text-gray-300">
                <p className="mb-2">{result.explanations.clinical_interpretation.summary}</p>
                {result.explanations.clinical_interpretation.key_factors?.length > 0 && (
                  <div className="mt-3">
                    <h4 className="text-xs font-semibold tracking-wide uppercase text-brand-600 dark:text-brand-300 mb-1">Key Factors</h4>
                    <ul className="space-y-1 text-xs">
                      {result.explanations.clinical_interpretation.key_factors.map((f,i)=>(
                        <li key={i} className="flex gap-2"><span className="font-medium text-brand-700 dark:text-brand-200">{f.feature}:</span><span>{f.interpretation}</span></li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <XAIExplanation explanation={result.explanations} />

      <div className="card space-y-4">
        <h3 className="heading">Next Steps</h3>
        <div className="flex flex-wrap gap-4">
          <button onClick={resetForm} className="btn-primary h-11 px-6">Run Another Test</button>
            <button onClick={() => navigate('/patient')} className="btn-secondary h-11 px-6">Dashboard</button>
          <button onClick={() => navigate('/patient/prescriptions')} className="btn-outline h-11 px-6">Prescriptions</button>
        </div>
        <div className="p-4 rounded-md bg-yellow-50 dark:bg-yellow-600/20 border border-yellow-200 dark:border-yellow-500/30 text-sm text-yellow-800 dark:text-yellow-100">
          <strong>Important:</strong> AI predictions support—not replace—professional medical evaluation.
        </div>
      </div>
    </div>
  );
};

export default PredictionForm;
