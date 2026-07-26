'use client';

export default function LoginPage() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <div className="card" style={{ width: '100%', maxWidth: '400px' }}>
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <h1 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Customer Portal</h1>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>Sign in to manage your account</p>
        </div>

        <form style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.25rem', fontWeight: 500 }}>Email Address</label>
            <input type="email" placeholder="you@example.com" style={{ width: '100%', padding: '0.6rem', borderRadius: 'var(--radius)', border: '1px solid var(--color-border)' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.25rem', fontWeight: 500 }}>Password</label>
            <input type="password" placeholder="••••••••" style={{ width: '100%', padding: '0.6rem', borderRadius: 'var(--radius)', border: '1px solid var(--color-border)' }} />
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>Sign In</button>
        </form>

        <div style={{ marginTop: '1rem', textAlign: 'center' }}>
          <a href="#" style={{ fontSize: '0.85rem', color: 'var(--color-primary)' }}>Forgot password?</a>
        </div>

        <hr style={{ margin: '1.5rem 0', border: 'none', borderTop: '1px solid var(--color-border)' }} />

        <div style={{ textAlign: 'center' }}>
          <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
            Don&apos;t have an account? Contact your service provider.
          </p>
        </div>
      </div>
    </div>
  );
}
