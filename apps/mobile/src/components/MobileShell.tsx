'use client';

const navItems = [
  { path: '/', label: 'Today', icon: '📋' },
  { path: '/schedule', label: 'Schedule', icon: '📅' },
  { path: '/navigate', label: 'Navigate', icon: '🗺' },
  { path: '/inventory', label: 'Parts', icon: '🔧' },
  { path: '/clock', label: 'Clock', icon: '⏱' },
];

type Props = { activePath: string; title: string; children: React.ReactNode };

export function MobileShell({ activePath, title, children }: Props) {
  return (
    <div className="mobile-shell">
      <header className="mobile-header">
        <h1>{title}</h1>
        <span style={{ fontSize: '0.8rem', opacity: 0.8 }}>Mike J.</span>
      </header>
      <main className="mobile-content">{children}</main>
      <nav className="mobile-nav">
        {navItems.map(item => (
          <a key={item.path} href={item.path} className={activePath === item.path ? 'active' : ''}>
            <span>{item.icon}</span>
            {item.label}
          </a>
        ))}
      </nav>
    </div>
  );
}
