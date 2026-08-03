'use client';

import { useEffect, useState } from 'react';
import { authFetch } from '@/auth/session';
import Link from 'next/link';

interface TrialStatus {
  isTrial: boolean;
  status: string;
  plan: string;
  daysRemaining: number;
  expiresAt: string;
  entitlements: {
    maxUsers: number;
    maxCustomers: number;
    maxJobs: number;
    maxInvoices: number;
    features: string[];
  };
}

export function TrialBanner() {
  const [trial, setTrial] = useState<TrialStatus | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    authFetch('/api/v1/trial/status')
      .then(r => r.json())
      .then(body => { if (body.data?.isTrial) setTrial(body.data); })
      .catch(() => {});
  }, []);

  if (!trial || !trial.isTrial || dismissed) return null;

  const urgency = trial.daysRemaining <= 3 ? 'urgent' : trial.daysRemaining <= 7 ? 'warning' : 'info';

  return (
    <div className={`trial-banner trial-banner-${urgency}`} role="status">
      <div className="trial-banner-content">
        <strong>
          {trial.status === 'expired'
            ? 'Your trial has ended'
            : `${trial.daysRemaining} day${trial.daysRemaining === 1 ? '' : 's'} left in your trial`}
        </strong>
        <span className="trial-plan">ServicePro {trial.plan}</span>
      </div>
      <div className="trial-banner-actions">
        <Link href="/settings/upgrade" className="button button-small">
          {trial.status === 'expired' ? 'Upgrade now' : 'View plans'}
        </Link>
        {trial.status !== 'expired' && (
          <button className="text-link" onClick={() => setDismissed(true)} aria-label="Dismiss trial banner">
            ✕
          </button>
        )}
      </div>
    </div>
  );
}
