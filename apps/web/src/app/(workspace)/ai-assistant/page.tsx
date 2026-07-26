'use client';

import dynamic from 'next/dynamic';

const AiChat = dynamic(
  () => import('@/components/AiChat').then(m => m.AiChat),
  { ssr: false, loading: () => <section className="panel" aria-busy="true"><p>Loading AI assistant…</p></section> }
);

export default function AiAssistantPage() {
  return (
    <div className="dashboard-content">
      <div className="dashboard-intro">
        <div>
          <p className="eyebrow"><span aria-hidden="true" /> Intelligence</p>
          <h1>AI Assistant</h1>
          <p>Ask questions about your business, get recommendations, and search your knowledge base.</p>
        </div>
      </div>
      <AiChat />
    </div>
  );
}
