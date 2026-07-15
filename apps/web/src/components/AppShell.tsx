'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { type ReactNode, useEffect, useMemo, useRef, useState } from 'react';
import { authFetch, type AuthSession, readSession } from '@/auth/session';
import { BrandMark } from '@/components/BrandMark';
import { LogoutButton } from '@/components/LogoutButton';
import { ThemeToggle } from '@/components/ThemeToggle';

const navigation = [
  { label: 'Overview', href: '/dashboard', icon: '⌂' },
  { label: 'Work orders', href: '/work-orders', icon: '▤' },
  { label: 'Schedule', href: '/schedule', icon: '◫' },
  { label: 'Customers', href: '/customers', icon: '◎' },
  { label: 'Assets', href: '/assets', icon: '◇' },
  { label: 'Knowledge', href: '/knowledge', icon: 'K' },
  { label: 'Notifications', href: '/notifications', icon: '!' },
  { label: 'Organization', href: '/organization', icon: '◎' },
  { label: 'Reports', href: '/reports', icon: '↗' },
  { label: 'Marketplace', href: '/marketplace', icon: '+' },
  { label: 'Documentation', href: '/docs', icon: '?' },
];

const titleCase = (value: string) => value.replace(/-/g, ' ').replace(/\b\w/g, letter => letter.toUpperCase());

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const searchRef = useRef<HTMLInputElement>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [session, setSession] = useState<AuthSession | null>(null);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const userName = session?.user.name || session?.user.email || 'ServicePro user';
  const initials = userName.split(/\s|@/).filter(Boolean).slice(0, 2).map(part => part[0]?.toUpperCase()).join('') || 'SP';
  const crumbs = pathname.split('/').filter(Boolean).map((part, index, all) => ({
    label: titleCase(part),
    href: `/${all.slice(0, index + 1).join('/')}`,
  }));
  const results = useMemo(() => navigation.filter(item => item.label.toLowerCase().includes(query.toLowerCase())), [query]);

  useEffect(() => {
    const sync=()=>setSession(readSession()); sync(); window.addEventListener('servicepro:session',sync); return ()=>window.removeEventListener('servicepro:session',sync);
  }, []);

  useEffect(() => {
    if (!session) return;
    const sync=()=>authFetch('/api/v1/notifications').then(response=>response.ok?response.json():null).then(body=>setUnreadNotifications(body?.data?.filter((row:{readAt?:string})=>!row.readAt).length||0)).catch(()=>{});
    sync(); window.addEventListener('servicepro:notifications',sync); return ()=>window.removeEventListener('servicepro:notifications',sync);
  }, [session]);

  useEffect(() => {
    function shortcut(event: KeyboardEvent) {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setSearchOpen(true);
      }
      if (event.key === 'Escape') {
        setSearchOpen(false);
        setProfileOpen(false);
        setMobileOpen(false);
      }
    }
    window.addEventListener('keydown', shortcut);
    return () => window.removeEventListener('keydown', shortcut);
  }, []);

  useEffect(() => {
    if (searchOpen) window.setTimeout(() => searchRef.current?.focus(), 0);
  }, [searchOpen]);

  function navigate(href: string) {
    setSearchOpen(false);
    setMobileOpen(false);
    router.push(href);
  }

  return <main className={`app-shell ${mobileOpen ? 'nav-open' : ''}`}>
    <button className="nav-scrim" type="button" aria-label="Close navigation" onClick={() => setMobileOpen(false)} />
    <aside className="sidebar" aria-label="Primary navigation">
      <div className="sidebar-brand-row"><BrandMark /><button className="sidebar-close" type="button" aria-label="Close navigation" onClick={() => setMobileOpen(false)}>×</button></div>
      <label className="tenant-picker"><span>Workspace</span><select aria-label="Select workspace" defaultValue={session?.user.tenantId || 'current'}><option value={session?.user.tenantId || 'current'}>{session?.user.tenantId || 'Current workspace'}</option></select></label>
      <nav>{navigation.map(item => <Link className={pathname === item.href ? 'active' : ''} href={item.href} key={item.href} onClick={() => setMobileOpen(false)}><span aria-hidden="true">{item.icon}</span>{item.label}</Link>)}</nav>
      <div className="sidebar-bottom"><Link href="/settings"><span aria-hidden="true">⚙</span>Settings</Link><LogoutButton /><div className="user-chip"><b>{initials}</b><span><strong>{userName}</strong><small>{session?.user.roles?.[0] || 'Workspace member'}</small></span></div></div>
    </aside>
    <section className="workspace">
      <header className="workspace-header">
        <div className="header-context"><button className="menu-button" type="button" aria-label="Open navigation" aria-expanded={mobileOpen} onClick={() => setMobileOpen(true)}>☰</button><div><nav className="breadcrumbs" aria-label="Breadcrumb">{crumbs.map((crumb, index) => <span key={crumb.href}>{index > 0 && <i>/</i>}<Link href={crumb.href} aria-current={index === crumbs.length - 1 ? 'page' : undefined}>{crumb.label}</Link></span>)}</nav><strong>{crumbs.at(-1)?.label || 'Workspace'}</strong></div></div>
        <div className="workspace-actions"><button className="search-button" type="button" onClick={() => setSearchOpen(true)} aria-haspopup="dialog">⌕ <span>Search anything</span><kbd>Ctrl K</kbd></button><ThemeToggle /><Link className="icon-button notification-button" href="/notifications" aria-label={`${unreadNotifications} unread notifications`}>♢{unreadNotifications>0&&<i />}</Link><div className="profile-wrap"><button className="profile-button" type="button" aria-label="Open profile menu" aria-expanded={profileOpen} onClick={() => setProfileOpen(value => !value)}><b>{initials}</b></button>{profileOpen && <div className="profile-menu"><strong>{userName}</strong><small>{session?.user.email}</small><Link href="/profile">Profile and preferences</Link><Link href="/settings">Workspace settings</Link><LogoutButton /></div>}</div></div>
      </header>
      {children}
    </section>
    {searchOpen && <div className="command-backdrop" role="presentation" onMouseDown={() => setSearchOpen(false)}><section className="command-menu" role="dialog" aria-modal="true" aria-label="Search ServicePro" onMouseDown={event => event.stopPropagation()}><label><span aria-hidden="true">⌕</span><input ref={searchRef} value={query} onChange={event => setQuery(event.target.value)} placeholder="Search pages and actions" aria-label="Search pages and actions" /><kbd>Esc</kbd></label><div>{results.length ? results.map(item => <button type="button" key={item.href} onClick={() => navigate(item.href)}><span>{item.icon}</span>{item.label}<small>Open</small></button>) : <p>No matching pages.</p>}</div></section></div>}
  </main>;
}
