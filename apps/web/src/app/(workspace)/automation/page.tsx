'use client';

import dynamic from 'next/dynamic';

const AutomationBuilder = dynamic(
  () => import('@/components/AutomationBuilder').then(m => m.AutomationBuilder),
  { ssr: false, loading: () => <section className="panel" aria-busy="true"><p>Loading automation…</p></section> }
);

export default function AutomationPage() {
  return (
    <div className="dashboard-content">
      <div className="dashboard-intro">
        <div>
          <p className="eyebrow"><span aria-hidden="true" /> Operations</p>
          <h1>Automation</h1>
          <p>Build workflows that automate repetitive tasks with triggers, conditions, and actions.</p>
        </div>
      </div>
      <AutomationBuilder />
    </div>
  );
}
