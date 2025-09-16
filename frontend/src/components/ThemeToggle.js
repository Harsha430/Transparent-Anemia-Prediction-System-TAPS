import React, { useEffect, useState } from 'react';

const ThemeToggle = ({ className = '' }) => {
  const [mode, setMode] = useState('light');

  useEffect(() => {
    const stored = localStorage.getItem('theme-mode');
    if (stored === 'dark' || (!stored && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      document.documentElement.classList.add('dark');
      setMode('dark');
    } else {
      document.documentElement.classList.remove('dark');
      setMode('light');
    }
  }, []);

  const toggle = () => {
    const next = mode === 'dark' ? 'light' : 'dark';
    setMode(next);
    localStorage.setItem('theme-mode', next);
    document.documentElement.classList.toggle('dark', next === 'dark');
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label="Toggle color theme"
      className={`btn-ghost h-9 w-9 p-0 rounded-full relative overflow-hidden ${className}`}
    >
      <span className="absolute inset-0 flex items-center justify-center transition-opacity duration-300" style={{opacity: mode==='light'?1:0}}>
        {/* Sun Icon */}
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2m10-10h-2M4 12H2m15.07 7.07-1.42-1.42M6.35 6.35 4.93 4.93m12.72 0-1.42 1.42M6.35 17.65l-1.42 1.42"/></svg>
      </span>
      <span className="absolute inset-0 flex items-center justify-center transition-opacity duration-300" style={{opacity: mode==='dark'?1:0}}>
        {/* Moon Icon */}
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
      </span>
    </button>
  );
};

export default ThemeToggle;

