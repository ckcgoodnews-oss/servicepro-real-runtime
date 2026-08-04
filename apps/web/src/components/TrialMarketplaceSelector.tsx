'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { authFetch } from '@/auth/session';

interface Offering {
  id: string;
  name: string;
  description: string;
  features: string[];
  accentColor: string;
  industries: string[];
}

export function TrialMarketplaceSelector() {
  const router = useRouter();
  const [offerings, setOfferings] = useState<Offering[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    authFetch('/api/v1/trial/marketplace/offerings')
      .then(r => r.json())
      .then(body => { if (body.data?.offerings) setOfferings(body.data.offerings); })
      .catch(() => setError('Could not load service packs.'))
      .finally(() => setLoading(false));
  }, []);

  function toggle(id: string) {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) { next.delete(id); }
      else if (next.size < 3) { next.add(id); }
      return next;
    });
  }

  async function confirm() {
    if (selected.size === 0) { setError('Select at least 1 service pack.'); return; }
    setSubmitting(true);
    setError('');
    try {
      const res = await authFetch('/api/v1/trial/marketplace/select', {
        method: 'POST',
        body: JSON.stringify({ selections: [...selected] })
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error?.message || 'Selection failed');
      router.replace('/trial-workspace');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong.');
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <div className="marketplace-loading">Loading service packs...</div>;

  return (
    <div className="marketplace-selector">
      <div className="marketplace-header">
        <h2>Choose your services</h2>
        <p className="muted">Select 1–3 service packs to generate your website. You can change this later.</p>
        <span className="selection-count">{selected.size} of 3 selected</span>
      </div>

      {error && <p className="form-error" role="alert">{error}</p>}

      <div className="marketplace-grid">
        {offerings.map(offering => (
          <button
            key={offering.id}
            type="button"
            className={`marketplace-card ${selected.has(offering.id) ? 'selected' : ''}`}
            onClick={() => toggle(offering.id)}
            aria-pressed={selected.has(offering.id)}
            style={{ '--accent': offering.accentColor } as React.CSSProperties}
          >
            <div className="card-accent" />
            <h3>{offering.name.replace(/ Pack$| Operations Pack$/, '')}</h3>
            <p>{offering.description}</p>
            <ul className="card-features">
              {offering.features.map(f => <li key={f}>{f}</li>)}
            </ul>
            <span className="card-check">{selected.has(offering.id) ? '✓' : '+'}</span>
          </button>
        ))}
      </div>

      <div className="marketplace-actions">
        <button
          className="button"
          onClick={confirm}
          disabled={submitting || selected.size === 0}
        >
          {submitting ? 'Generating your site...' : `Generate site with ${selected.size} pack${selected.size !== 1 ? 's' : ''}`}
        </button>
      </div>
    </div>
  );
}
