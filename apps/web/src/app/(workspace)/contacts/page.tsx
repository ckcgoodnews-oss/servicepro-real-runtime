'use client';

import dynamic from 'next/dynamic';

const ContactsWorkspace = dynamic(
  () => import('@/components/ContactsWorkspace').then(m => m.ContactsWorkspace),
  { ssr: false, loading: () => <section className="panel" aria-busy="true"><p>Loading Contacts…</p></section> }
);

export default function ContactsPage() {
  return (
    <div className="dashboard-content">
      <div className="dashboard-intro">
        <div>
          <p className="eyebrow"><span aria-hidden="true" /> CRM</p>
          <h1>Contacts</h1>
          <p>Manage contacts, track lifecycle stages, and build customer relationships.</p>
        </div>
      </div>
      <ContactsWorkspace />
    </div>
  );
}
