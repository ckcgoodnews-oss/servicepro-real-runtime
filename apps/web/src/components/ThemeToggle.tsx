'use client';

import { useEffect, useState } from 'react';

export function ThemeToggle() {
  const [dark, setDark] = useState(false);
  useEffect(() => {
    const saved = window.localStorage.getItem('servicepro-theme');
    const wantsDark = saved ? saved === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches;
    document.documentElement.dataset.theme = wantsDark ? 'dark' : 'light';
    setDark(wantsDark);
  }, []);
  function toggleTheme() {
    const next = !dark;
    setDark(next);
    document.documentElement.dataset.theme = next ? 'dark' : 'light';
    window.localStorage.setItem('servicepro-theme', next ? 'dark' : 'light');
  }
  return <button className="icon-button" type="button" onClick={toggleTheme} aria-label={`Use ${dark ? 'light' : 'dark'} theme`}><span aria-hidden="true">{dark ? '☀' : '◐'}</span></button>;
}
