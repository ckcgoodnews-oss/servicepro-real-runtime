'use client';

import dynamic from 'next/dynamic';

const WorkOrderWorkspace = dynamic(
  () =>
    import('@/components/WorkOrderWorkspace').then(
      (module) => module.WorkOrderWorkspace,
    ),
  {
    ssr: false,
    loading: () => (
      <section className="panel" aria-busy="true" aria-live="polite">
        <p>Loading the service calendar…</p>
      </section>
    ),
  },
);

export default function SchedulePage() {
  return (
    <div className="dashboard-content work-orders-page">
      <div className="dashboard-intro">
        <div>
          <p className="eyebrow">
            <span aria-hidden="true" /> Service calendar
          </p>
          <h1>Schedule</h1>
          <p>
            Coordinate appointments, technician assignments, and service
            windows across every trade.
          </p>
        </div>
      </div>

      <WorkOrderWorkspace initialView="calendar" />
    </div>
  );
}