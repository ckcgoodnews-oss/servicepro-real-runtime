'use client';

import dynamic from 'next/dynamic';

const WebsiteEditor = dynamic(
  () => import('@/components/WebsiteEditor').then(m => m.WebsiteEditor),
  { ssr: false, loading: () => <section className="panel" aria-busy="true"><p>Loading website editor…</p></section> }
);

export default function WebsiteBuilderPage() {
  return (
    <div className="dashboard-content">
      <div className="dashboard-intro">
        <div>
          <p className="eyebrow"><span aria-hidden="true" /> Website</p>
          <h1>Website Builder</h1>
          <p>Build and publish multi-page websites with drag-and-drop sections.</p>
        </div>
      </div>
      <WebsiteEditor />
    </div>
  );
}
