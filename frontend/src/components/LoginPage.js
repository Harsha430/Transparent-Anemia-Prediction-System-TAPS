import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const LoginPage = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    if (!formData.email || !formData.password) {
      setError('Please fill in all fields');
      setIsLoading(false);
      return;
    }
    try {
      const result = await login(formData.email, formData.password);
      if (result.success) navigate('/dashboard'); else setError(result.error);
    } catch (err) { setError('An unexpected error occurred'); } finally { setIsLoading(false); }
  };

  const fillTest = (type) => {
    if (type === 'patient') setFormData({ email: 'patient@email.com', password: 'patient123' });
    if (type === 'doctor') setFormData({ email: 'doctor@hospital.com', password: 'doctor123' });
  };

  return (
    <div className="w-full px-4">
      <div className="max-w-md mx-auto animate-fade-in">
        <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 shadow-elevated mb-4">
              <span className="text-white font-bold text-xl">AI</span>
            </div>
            <h1 className="heading-xl text-brand-100">Anaemia Intelligence</h1>
            <p className="subtle mt-2 text-brand-100/70">Predict • Explain • Empower</p>
        </div>
        <div className="auth-panel rounded-2xl p-8">
          <form className="space-y-6" onSubmit={handleSubmit} noValidate>
            <div>
              <label htmlFor="email" className="form-label text-brand-200">Email</label>
              <input id="email" name="email" type="email" autoComplete="email" required value={formData.email} onChange={handleChange} className="auth-input-dark" placeholder="you@example.com" />
            </div>
            <div>
              <label htmlFor="password" className="form-label text-brand-200">Password</label>
              <input id="password" name="password" type="password" autoComplete="current-password" required value={formData.password} onChange={handleChange} className="auth-input-dark" placeholder="••••••••" />
            </div>
            {error && <div className="alert-error">{error}</div>}
            <button type="submit" disabled={isLoading} className="auth-button-primary w-full h-11 text-sm font-semibold tracking-wide">{isLoading ? 'Signing in...' : 'Sign In'}</button>
          </form>
          <div className="mt-10">
            <div className="flex items-center mb-4"><div className="flex-grow h-px bg-gradient-to-r from-transparent via-brand-400/40 to-transparent"/><span className="text-[11px] uppercase tracking-wider font-semibold text-brand-300 px-3">Test Accounts</span><div className="flex-grow h-px bg-gradient-to-r from-transparent via-brand-400/40 to-transparent"/></div>
            <div className="grid grid-cols-2 gap-3">
              <button type="button" onClick={()=>fillTest('patient')} className="auth-test-btn">Patient</button>
              <button type="button" onClick={()=>fillTest('doctor')} className="auth-test-btn">Doctor</button>
            </div>
          </div>
          <div className="mt-8 text-center">
            <p className="text-xs text-brand-300/70">Protected environment • Authorized medical use only</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
