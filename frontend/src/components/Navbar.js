import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ThemeToggle from './ThemeToggle';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItemsDoctor = [
    { to: '/doctor', label: 'Overview' },
    { to: '/doctor/patients', label: 'Patients' }
  ];
  const navItemsPatient = [
    { to: '/patient', label: 'Dashboard' },
    { to: '/patient/predict', label: 'New Test' },
    { to: '/patient/prescriptions', label: 'Prescriptions' }
  ];

  const list = user?.role === 'doctor' ? navItemsDoctor : navItemsPatient;

  return (
    <header className="fixed top-0 inset-x-0 z-40">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mt-3 rounded-xl bg-gradient-to-r from-brand-700 via-brand-600 to-brand-700 p-[1px] shadow-elevated">
          <div className="glass relative flex h-16 items-center justify-between rounded-[0.70rem] px-4">
            {/* Left */}
            <div className="flex items-center gap-6">
              <Link to={user ? (user.role === 'doctor' ? '/doctor' : '/patient') : '/'} className="flex items-center gap-2 group">
                <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center shadow-soft text-white font-bold tracking-tight group-hover:scale-105 transition-transform">AI</div>
                <div className="leading-tight">
                  <div className="text-sm font-semibold text-white/90 tracking-wide">Anaemia Intelligence</div>
                  <div className="text-[11px] font-medium text-brand-100/80">Predict • Explain • Care</div>
                </div>
              </Link>
              {/* Desktop Nav */}
              {user && (
                <nav className="hidden md:flex items-center gap-1">
                  {list.map(item => (
                    <Link
                      key={item.to}
                      to={item.to}
                      className="px-3 py-2 rounded-md text-sm font-medium text-brand-100/80 hover:text-white hover:bg-white/10 transition-colors"
                    >
                      {item.label}
                    </Link>
                  ))}
                </nav>
              )}
            </div>

            {/* Right */}
            <div className="flex items-center gap-2">
              <ThemeToggle />
              {user && (
                <div className="hidden sm:flex flex-col items-end mr-3">
                  <span className="text-xs font-medium text-brand-100/80">{user.role === 'doctor' ? 'Doctor' : 'Patient'}</span>
                  <span className="text-sm font-semibold text-white leading-none">{user.name}</span>
                </div>
              )}
              {user && (
                <button onClick={handleLogout} className="btn-secondary h-9 px-4 !text-xs font-semibold">
                  Logout
                </button>
              )}
              {user && (
                <button
                  className="md:hidden inline-flex items-center justify-center h-9 w-9 rounded-md text-brand-100 hover:bg-white/10 focus:outline-none"
                  onClick={() => setOpen(o => !o)}
                  aria-label="Toggle navigation"
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                    {open ? <path d="M6 18L18 6M6 6l12 12" /> : <path d="M3 6h18M3 12h18M3 18h18" />}
                  </svg>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
      {/* Mobile Panel */}
      {user && open && (
        <div className="md:hidden animate-fade-in mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-2">
          <div className="glass rounded-xl p-4 shadow-soft border border-white/20">
            <nav className="flex flex-col gap-1">
              {list.map(i => (
                <Link
                  key={i.to}
                  to={i.to}
                  onClick={() => setOpen(false)}
                  className="px-3 py-2 rounded-md text-sm font-medium text-brand-700 dark:text-brand-100 hover:bg-brand-100/70 dark:hover:bg-brand-700/40"
                >
                  {i.label}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
