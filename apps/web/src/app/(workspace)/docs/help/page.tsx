'use client';

import dynamic from 'next/dynamic';

const HelpCenter = dynamic(
  () => import('@/components/docs/HelpCenter').then(m => m.HelpCenter),
  { ssr: false, loading: () => <section className="panel" aria-busy="true"><p>Loading Help Center…</p></section> }
);

export default function HelpCenterPage() {
  return (
    <div className="dashboard-content docs-page">
      <div className="dashboard-intro">
        <div>
          <p className="eyebrow"><span aria-hidden="true" /> Learning Center</p>
          <h1>Help & Tutorials</h1>
          <p>Step-by-step guides, walkthroughs, and answers for every feature — organized by role.</p>
        </div>
      </div>
      <HelpCenter />
    </div>
  );
}
