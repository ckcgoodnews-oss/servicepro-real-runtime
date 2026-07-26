'use client';

import { useState } from 'react';

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: '📊' },
  { path: '/appointments', label: 'Appointments', icon: '📅' },
  { path: '/invoices', label: 'Invoices & Payments', icon: '💳' },
  { path: '/estimates', label: 'Estimates', icon: '📋' },
  { path: '/history', label: 'Service History', icon: '🔧' },
  { path: '/equipment', label: 'My Equipment', icon: '⚙️' },
  { path: '/documents', label: 'Documents', icon: '📁' },
  { path: '/messages', label: 'Messages', icon: '💬' },
  { path: '/support', label: 'Get Support', icon: '🎧' },
  { path: '/profile', label: 'Profile & Settings', icon: '👤' },
];

type PortalShellProps = {
  activePath: string;
  children: React.ReactNode;
};

export function PortalShell({ activePath, children }: PortalShellProps) {
  const [companyName] = useState('ServicePro');

  return (
    <div className="portal-shell">
      <aside className="portal-sidebar">
        <div style={{ padding: '0 1.5rem', marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 600 }}>{companyName}</h2>
          <p style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>Customer Portal</p>
        </div>
        <nav>
          <ul className="portal-nav">
            {navItems.map(item => (
              <li key={item.path}>
                <a href={item.path} className={activePath === item.path ? 'active' : ''}>
                  <span>{item.icon}</span>
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <div style={{ marginTop: 'auto', padding: '1rem 1.5rem', borderTop: '1px solid var(--color-border)' }}>
          <button className="btn btn-outline" style={{ width: '100%' }}>Sign Out</button>
        </div>
      </aside>
      <main className="portal-main">
        {children}
      </main>
    </div>
  );
}
