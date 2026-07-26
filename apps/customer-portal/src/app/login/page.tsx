'use client';

import { useState } from 'react';
import { login } from '@/lib/api';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const result = await login(email, password);
      if ('error' in result) {
        setError(result.error.message);
      } else {
        window.location.href = '/';
      }
    } catch {
      setError('Unable to connect to server. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <div className="card" style={{ width: '100%', maxWidth: '400px' }}>
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <h1 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Customer Portal</h1>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>Sign in to manage your account</p>
        </div>

        {error && (
          <div style={{ background: '#fce8e6', border: '1px solid #f5c6cb', borderRadius: '6px', padding: '0.6rem 0.8rem', marginBottom: '1rem', fontSize: '0.85rem', color: '#c5221f' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.25rem', fontWeight: 500 }}>Email Address</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" required style={{ width: '100%', padding: '0.6rem', borderRadius: 'var(--radius)', border: '1px solid var(--color-border)' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.25rem', fontWeight: 500 }}>Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required style={{ width: '100%', padding: '0.6rem', borderRadius: 'var(--radius)', border: '1px solid var(--color-border)' }} />
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%', justifyContent: 'center' }}>
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>

        <div style={{ marginTop: '1rem', textAlign: 'center' }}>
          <a href="#" style={{ fontSize: '0.85rem', color: 'var(--color-primary)' }}>Forgot password?</a>
        </div>
      </div>
    </div>
  );
}
