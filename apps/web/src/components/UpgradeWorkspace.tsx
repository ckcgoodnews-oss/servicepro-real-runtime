'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { authFetch } from '@/auth/session';

interface Plan {
  name: string;
  price: string;
  features: string[];
  recommended?: boolean;
}

const PLANS: Plan[] = [
  {
    name: 'Starter',
    price: '$49/mo',
    features: ['3 users', '100 active jobs', 'Customers', 'Scheduling', 'Invoicing']
  },
  {
    name: 'Professional',
    price: '$99/mo',
    recommended: true,
    features: ['12 users', '500 active jobs', 'Everything in Starter', 'Dispatch', 'Estimates', 'Customer portal', 'Reporting']
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    features: ['Unlimited users', 'Unlimited jobs', 'Everything in Professional', 'AI assistant', 'Marketplace', 'Custom integrations', 'Dedicated support']
  }
];

export function UpgradeWorkspace() {
  const [trialStatus, setTrialStatus] = useState<{ isTrial: boolean; daysRemaining: number; plan: string } | null>(null);
  const [selectedPlan, setSelectedPlan] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    authFetch('/api/v1/trial/status')
      .then(r => r.json())
      .then(body => { if (body.data) setTrialStatus(body.data); })
      .catch(() => {});
  }, []);

  async function submitUpgrade(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      const res = await authFetch('/api/v1/trial/upgrade-request', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ plan: selectedPlan, message })
      });
      const body = await res.json();
      if (res.ok) setSubmitted(true);
      else throw new Error(body.error?.message || 'Request failed');
    } catch {
      // silent
    } finally {
      setBusy(false);
    }
  }

  if (submitted) {
    return (
      <div className="workspace upgrade-workspace">
        <div className="panel">
          <h1>Upgrade request received</h1>
          <p>Our team will contact you within 1 business day to discuss your plan and get you set up.</p>
          <p>Your trial will continue in the meantime — no interruption to your work.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="workspace upgrade-workspace">
      <div className="panel">
        <h1>Choose your plan</h1>
        {trialStatus?.isTrial && (
          <p className="muted">
            You have {trialStatus.daysRemaining} day{trialStatus.daysRemaining === 1 ? '' : 's'} remaining on your {trialStatus.plan} trial.
            All your data will be preserved when you upgrade.
          </p>
        )}
      </div>

      <div className="plans-grid">
        {PLANS.map(plan => (
          <div
            key={plan.name}
            className={`plan-card ${plan.recommended ? 'plan-recommended' : ''} ${selectedPlan === plan.name.toLowerCase() ? 'plan-selected' : ''}`}
            onClick={() => setSelectedPlan(plan.name.toLowerCase())}
            role="button"
            tabIndex={0}
            onKeyDown={e => { if (e.key === 'Enter') setSelectedPlan(plan.name.toLowerCase()); }}
          >
            {plan.recommended && <span className="plan-badge">Recommended</span>}
            <h2>{plan.name}</h2>
            <p className="plan-price">{plan.price}</p>
            <ul>
              {plan.features.map(f => <li key={f}>✓ {f}</li>)}
            </ul>
            <button
              className={`button ${plan.recommended ? '' : 'button-outline'}`}
              onClick={(e) => { e.stopPropagation(); setSelectedPlan(plan.name.toLowerCase()); }}
            >
              {plan.price === 'Custom' ? 'Contact sales' : 'Select'}
            </button>
          </div>
        ))}
      </div>

      {selectedPlan && (
        <form className="panel upgrade-form" onSubmit={submitUpgrade}>
          <h2>Request upgrade to {selectedPlan}</h2>
          <label>
            Anything you&apos;d like us to know? (optional)
            <textarea name="message" value={message} onChange={e => setMessage(e.target.value)} rows={3} placeholder="Questions, timeline, specific needs..." />
          </label>
          <button className="button" type="submit" disabled={busy}>
            {busy ? 'Submitting...' : 'Request upgrade'}
          </button>
          <p className="muted">No credit card required to request. Our team will reach out to finalize.</p>
        </form>
      )}
    </div>
  );
}
