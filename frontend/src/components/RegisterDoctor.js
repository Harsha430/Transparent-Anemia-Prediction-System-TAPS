import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const RegisterDoctor = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    hospital: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { registerDoctor } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    const { confirmPassword, ...doctorData } = formData;
    const result = await registerDoctor(doctorData);

    if (result.success) {
      navigate('/doctor');
    } else {
      setError(result.error);
    }

    setLoading(false);
  };

  return (
    <div className="w-full px-4">
      <div className="max-w-lg mx-auto animate-fade-in">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 shadow-elevated mb-4">
            <span className="text-white font-bold text-xl">AI</span>
          </div>
          <h1 className="heading-xl">Doctor Registration</h1>
          <p className="subtle mt-2">Join the Anaemia Intelligence clinical network</p>
        </div>
        <div className="glass rounded-2xl shadow-elevated border border-brand-600/10 p-8">
          <form className="space-y-6" onSubmit={handleSubmit} noValidate>
            <div className="grid md:grid-cols-2 gap-5">
              <Field label="Full Name">
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  className="form-input"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Dr. Jane Doe"
                />
              </Field>
              <Field label="Hospital / Institution">
                <input
                  id="hospital"
                  name="hospital"
                  type="text"
                  required
                  className="form-input"
                  value={formData.hospital}
                  onChange={handleChange}
                  placeholder="General Hospital"
                />
              </Field>
              <Field label="Email">
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  className="form-input"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="doctor@hospital.com"
                />
              </Field>
              <Field label="Password">
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  className="form-input"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                />
              </Field>
              <Field label="Confirm Password" wide>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  className="form-input"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Repeat password"
                />
              </Field>
            </div>
            {error && <div className="alert-error">{error}</div>}
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full h-11 text-sm font-semibold tracking-wide"
            >
              {loading ? 'Registering...' : 'Register'}
            </button>
          </form>
          <div className="mt-8 text-center">
            <Link
              to="/login"
              className="text-sm font-medium text-brand-600 hover:text-brand-700 dark:text-brand-300 dark:hover:text-brand-200"
            >
              Already have an account? Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

const Field = ({ label, children, wide }) => (
  <label className={`${wide ? 'md:col-span-2' : ''} flex flex-col gap-1`}>
    <span className="form-label normal-case">{label}</span>
    {children}
  </label>
);

export default RegisterDoctor;
