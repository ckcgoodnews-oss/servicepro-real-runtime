'use client';

import dynamic from 'next/dynamic';

const KnowledgeBase = dynamic(
  () => import('@/components/KnowledgeBase').then(m => m.KnowledgeBase),
  { ssr: false, loading: () => <section className="panel" aria-busy="true"><p>Loading knowledge base…</p></section> }
);

export default function KnowledgeBasePage() {
  return (
    <div className="dashboard-content">
      <div className="dashboard-intro">
        <div>
          <p className="eyebrow"><span aria-hidden="true" /> Intelligence</p>
          <h1>Knowledge Base</h1>
          <p>Create and manage articles that power the AI assistant and help your team.</p>
        </div>
      </div>
      <KnowledgeBase />
    </div>
  );
}
