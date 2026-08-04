'use client';

import dynamic from 'next/dynamic';

const BoardsWorkspace = dynamic(
  () => import('@/components/BoardsWorkspace').then(m => m.BoardsWorkspace),
  { ssr: false, loading: () => <section className="panel" aria-busy="true"><p>Loading Boards…</p></section> }
);

export default function BoardsPage() {
  return (
    <div className="dashboard-content">
      <div className="dashboard-intro">
        <div>
          <p className="eyebrow"><span aria-hidden="true" /> Work Management</p>
          <h1>Boards</h1>
          <p>Organize projects, track tasks, and manage workflows with configurable boards.</p>
        </div>
      </div>
      <BoardsWorkspace />
    </div>
  );
}
