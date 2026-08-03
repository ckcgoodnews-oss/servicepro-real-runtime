'use client';

import { useEffect, useState } from 'react';
import { authFetch } from '@/auth/session';
import Link from 'next/link';

interface OnboardingStep {
  key: string;
  label: string;
  sequence: number;
  status: string;
  completedAt: string | null;
}

interface OnboardingData {
  steps: OnboardingStep[];
  completed: number;
  total: number;
  allDone: boolean;
}

const STEP_LINKS: Record<string, string> = {
  company_info: '/settings',
  business_hours: '/settings',
  services: '/services',
  team: '/team',
  first_customer: '/customers',
  first_job: '/jobs',
  customer_portal: '/portal',
  storefront: '/storefront-builder'
};

export function OnboardingChecklist() {
  const [data, setData] = useState<OnboardingData | null>(null);
  const [dismissed, setDismissed] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const wasDismissed = sessionStorage.getItem('onboarding-dismissed');
    if (wasDismissed) { setDismissed(true); setLoading(false); return; }

    authFetch('/api/v1/trial/onboarding')
      .then(r => r.json())
      .then(body => { if (body.data) setData(body.data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading || dismissed || !data || data.allDone) return null;

  function dismiss() {
    setDismissed(true);
    sessionStorage.setItem('onboarding-dismissed', '1');
  }

  return (
    <div className="onboarding-checklist" role="region" aria-label="Setup checklist">
      <div className="onboarding-header">
        <div>
          <h3>Set up your ServicePro workspace</h3>
          <p className="muted">{data.completed} of {data.total} completed</p>
        </div>
        <button className="text-link" onClick={dismiss} aria-label="Dismiss checklist">✕</button>
      </div>
      <div className="onboarding-progress">
        <div className="onboarding-progress-bar" style={{ width: `${(data.completed / data.total) * 100}%` }} />
      </div>
      <ul className="onboarding-steps">
        {data.steps.map(step => (
          <li key={step.key} className={step.status === 'completed' ? 'step-done' : 'step-pending'}>
            <span className="step-icon">{step.status === 'completed' ? '✓' : '○'}</span>
            {STEP_LINKS[step.key] ? (
              <Link href={STEP_LINKS[step.key]}>{step.label}</Link>
            ) : (
              <span>{step.label}</span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
