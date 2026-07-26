'use client';

import { useState } from 'react';

type JobStatus = 'unassigned' | 'assigned' | 'en_route' | 'in_progress' | 'completed';
type Priority = 'low' | 'normal' | 'high' | 'emergency';

type DispatchJob = {
  id: string;
  title: string;
  customer: string;
  address: string;
  status: JobStatus;
  priority: Priority;
  scheduledTime: string;
  assignedTo: string;
  estimatedDuration: string;
};

type Technician = {
  id: string;
  name: string;
  status: 'available' | 'on_job' | 'en_route' | 'off_duty';
  currentJob: string;
  jobsToday: number;
  completedToday: number;
};

const DEMO_TECHS: Technician[] = [
  { id: 't1', name: 'Mike Johnson', status: 'available', currentJob: '', jobsToday: 4, completedToday: 2 },
  { id: 't2', name: 'Sarah Williams', status: 'on_job', currentJob: 'Water heater install', jobsToday: 3, completedToday: 1 },
  { id: 't3', name: 'James Rodriguez', status: 'en_route', currentJob: 'AC diagnostic', jobsToday: 5, completedToday: 3 },
  { id: 't4', name: 'Emily Chen', status: 'off_duty', currentJob: '', jobsToday: 0, completedToday: 0 },
];

const DEMO_JOBS: DispatchJob[] = [
  { id: 'j1', title: 'Emergency pipe burst', customer: 'Thompson Residence', address: '142 Oak Lane', status: 'unassigned', priority: 'emergency', scheduledTime: '9:00 AM', assignedTo: '', estimatedDuration: '2h' },
  { id: 'j2', title: 'AC maintenance', customer: 'Rivera Office', address: '880 Commerce Dr', status: 'assigned', priority: 'normal', scheduledTime: '10:30 AM', assignedTo: 't1', estimatedDuration: '1.5h' },
  { id: 'j3', title: 'Water heater install', customer: 'Park Family', address: '55 Maple St', status: 'in_progress', priority: 'high', scheduledTime: '8:00 AM', assignedTo: 't2', estimatedDuration: '3h' },
  { id: 'j4', title: 'Thermostat replacement', customer: 'Garcia Home', address: '221 Pine Ave', status: 'unassigned', priority: 'normal', scheduledTime: '1:00 PM', assignedTo: '', estimatedDuration: '1h' },
  { id: 'j5', title: 'AC diagnostic', customer: 'Wilson Corp', address: '400 Industrial Blvd', status: 'en_route', priority: 'normal', scheduledTime: '11:00 AM', assignedTo: 't3', estimatedDuration: '1h' },
  { id: 'j6', title: 'Drain cleaning', customer: 'Lee Apartment', address: '90 River Rd #4B', status: 'unassigned', priority: 'low', scheduledTime: '2:30 PM', assignedTo: '', estimatedDuration: '1h' },
];

const statusColors: Record<JobStatus, string> = {
  unassigned: '#ea4335', assigned: '#f9ab00', en_route: '#4285f4', in_progress: '#34a853', completed: '#5f6368'
};

const priorityLabels: Record<Priority, string> = {
  low: '○', normal: '●', high: '▲', emergency: '🚨'
};

const techStatusColors: Record<string, string> = {
  available: '#34a853', on_job: '#f9ab00', en_route: '#4285f4', off_duty: '#5f6368'
};

export function DispatchBoard() {
  const [jobs, setJobs] = useState(DEMO_JOBS);
  const [techs] = useState(DEMO_TECHS);
  const [view, setView] = useState<'board' | 'list' | 'map'>('board');
  const [draggedJob, setDraggedJob] = useState<string | null>(null);

  const unassigned = jobs.filter(j => j.status === 'unassigned');
  const assigned = jobs.filter(j => j.status === 'assigned');
  const enRoute = jobs.filter(j => j.status === 'en_route');
  const inProgress = jobs.filter(j => j.status === 'in_progress');

  function handleDrop(jobId: string, newStatus: JobStatus, techId?: string) {
    setJobs(prev => prev.map(j => j.id === jobId ? { ...j, status: newStatus, assignedTo: techId || j.assignedTo } : j));
    setDraggedJob(null);
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {/* Header Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '0.75rem' }}>
        <StatCard label="Unassigned" value={unassigned.length} color="#ea4335" />
        <StatCard label="Assigned" value={assigned.length} color="#f9ab00" />
        <StatCard label="En Route" value={enRoute.length} color="#4285f4" />
        <StatCard label="In Progress" value={inProgress.length} color="#34a853" />
        <StatCard label="Techs Available" value={techs.filter(t => t.status === 'available').length} color="#1a73e8" />
      </div>

      {/* View Switcher */}
      <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid #e0e0e0', paddingBottom: '0.5rem' }}>
        {(['board', 'list', 'map'] as const).map(v => (
          <button key={v} onClick={() => setView(v)}
            style={{ padding: '0.4rem 1rem', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: view === v ? 600 : 400, background: view === v ? '#e8f0fe' : 'transparent', color: view === v ? '#1a73e8' : '#5f6368' }}>
            {v === 'board' ? '◻ Board' : v === 'list' ? '☰ List' : '🗺 Map'}
          </button>
        ))}
      </div>

      {view === 'board' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', minHeight: '400px' }}>
          <Column title="Unassigned" color="#ea4335" jobs={unassigned} onDrop={(id) => handleDrop(id, 'unassigned')} draggedJob={draggedJob} setDraggedJob={setDraggedJob} techs={techs} />
          <Column title="Assigned" color="#f9ab00" jobs={assigned} onDrop={(id) => handleDrop(id, 'assigned')} draggedJob={draggedJob} setDraggedJob={setDraggedJob} techs={techs} />
          <Column title="En Route" color="#4285f4" jobs={enRoute} onDrop={(id) => handleDrop(id, 'en_route')} draggedJob={draggedJob} setDraggedJob={setDraggedJob} techs={techs} />
          <Column title="In Progress" color="#34a853" jobs={inProgress} onDrop={(id) => handleDrop(id, 'in_progress')} draggedJob={draggedJob} setDraggedJob={setDraggedJob} techs={techs} />
        </div>
      )}

      {view === 'list' && <ListView jobs={jobs} techs={techs} />}
      {view === 'map' && <MapView techs={techs} />}

      {/* Technician Panel */}
      <div style={{ marginTop: '1rem' }}>
        <h3 style={{ fontSize: '0.95rem', marginBottom: '0.75rem' }}>Technician Status</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '0.75rem' }}>
          {techs.map(tech => (
            <div key={tech.id} style={{ background: '#fff', border: '1px solid #e0e0e0', borderRadius: '8px', padding: '0.75rem', borderLeft: `4px solid ${techStatusColors[tech.status]}` }}
              onDragOver={e => e.preventDefault()} onDrop={() => draggedJob && handleDrop(draggedJob, 'assigned', tech.id)}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <strong style={{ fontSize: '0.85rem' }}>{tech.name}</strong>
                <span style={{ fontSize: '0.7rem', background: techStatusColors[tech.status] + '22', color: techStatusColors[tech.status], padding: '2px 6px', borderRadius: '4px' }}>{tech.status.replace('_', ' ')}</span>
              </div>
              {tech.currentJob && <p style={{ fontSize: '0.8rem', color: '#5f6368', marginTop: '0.25rem' }}>{tech.currentJob}</p>}
              <p style={{ fontSize: '0.75rem', color: '#9e9e9e', marginTop: '0.25rem' }}>{tech.completedToday}/{tech.jobsToday} jobs</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div style={{ background: '#fff', border: '1px solid #e0e0e0', borderRadius: '8px', padding: '0.75rem', textAlign: 'center' }}>
      <p style={{ fontSize: '1.5rem', fontWeight: 700, color }}>{value}</p>
      <p style={{ fontSize: '0.75rem', color: '#5f6368' }}>{label}</p>
    </div>
  );
}

function Column({ title, color, jobs, onDrop, draggedJob, setDraggedJob, techs }: {
  title: string; color: string; jobs: DispatchJob[]; onDrop: (id: string) => void;
  draggedJob: string | null; setDraggedJob: (id: string | null) => void; techs: Technician[];
}) {
  return (
    <div style={{ background: '#f8f9fa', borderRadius: '8px', padding: '0.75rem', minHeight: '300px', borderTop: `3px solid ${color}` }}
      onDragOver={e => e.preventDefault()} onDrop={() => draggedJob && onDrop(draggedJob)}>
      <h4 style={{ fontSize: '0.8rem', color: '#5f6368', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        {title} ({jobs.length})
      </h4>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {jobs.sort((a, b) => { const p = { emergency: 0, high: 1, normal: 2, low: 3 }; return p[a.priority] - p[b.priority]; }).map(job => (
          <JobCard key={job.id} job={job} techs={techs} onDragStart={() => setDraggedJob(job.id)} />
        ))}
      </div>
    </div>
  );
}

function JobCard({ job, techs, onDragStart }: { job: DispatchJob; techs: Technician[]; onDragStart: () => void }) {
  const tech = techs.find(t => t.id === job.assignedTo);
  return (
    <div draggable onDragStart={onDragStart} style={{ background: '#fff', border: '1px solid #e0e0e0', borderRadius: '6px', padding: '0.6rem', cursor: 'grab', borderLeft: `3px solid ${statusColors[job.status]}` }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <p style={{ fontSize: '0.8rem', fontWeight: 600, lineHeight: 1.3 }}>{job.title}</p>
        <span title={job.priority}>{priorityLabels[job.priority]}</span>
      </div>
      <p style={{ fontSize: '0.75rem', color: '#5f6368', marginTop: '0.2rem' }}>{job.customer}</p>
      <p style={{ fontSize: '0.7rem', color: '#9e9e9e' }}>{job.address}</p>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.4rem', fontSize: '0.7rem', color: '#5f6368' }}>
        <span>⏰ {job.scheduledTime}</span>
        <span>~{job.estimatedDuration}</span>
      </div>
      {tech && <p style={{ fontSize: '0.7rem', marginTop: '0.3rem', color: '#1a73e8' }}>👷 {tech.name}</p>}
    </div>
  );
}

function ListView({ jobs, techs }: { jobs: DispatchJob[]; techs: Technician[] }) {
  return (
    <div style={{ background: '#fff', border: '1px solid #e0e0e0', borderRadius: '8px', overflow: 'hidden' }}>
      <table style={{ width: '100%', fontSize: '0.85rem', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ background: '#f8f9fa', borderBottom: '1px solid #e0e0e0' }}>
            <th style={{ padding: '0.6rem', textAlign: 'left' }}>Priority</th>
            <th style={{ padding: '0.6rem', textAlign: 'left' }}>Job</th>
            <th style={{ padding: '0.6rem', textAlign: 'left' }}>Customer</th>
            <th style={{ padding: '0.6rem', textAlign: 'left' }}>Time</th>
            <th style={{ padding: '0.6rem', textAlign: 'left' }}>Technician</th>
            <th style={{ padding: '0.6rem', textAlign: 'left' }}>Status</th>
          </tr>
        </thead>
        <tbody>
          {jobs.map(job => {
            const tech = techs.find(t => t.id === job.assignedTo);
            return (
              <tr key={job.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                <td style={{ padding: '0.5rem 0.6rem' }}>{priorityLabels[job.priority]}</td>
                <td style={{ padding: '0.5rem 0.6rem', fontWeight: 500 }}>{job.title}</td>
                <td style={{ padding: '0.5rem 0.6rem' }}>{job.customer}</td>
                <td style={{ padding: '0.5rem 0.6rem' }}>{job.scheduledTime}</td>
                <td style={{ padding: '0.5rem 0.6rem' }}>{tech?.name || '—'}</td>
                <td style={{ padding: '0.5rem 0.6rem' }}>
                  <span style={{ background: statusColors[job.status] + '22', color: statusColors[job.status], padding: '2px 8px', borderRadius: '4px', fontSize: '0.75rem' }}>
                    {job.status.replace('_', ' ')}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function MapView({ techs }: { techs: Technician[] }) {
  return (
    <div style={{ background: '#e8f4e8', border: '1px solid #c8e6c9', borderRadius: '8px', padding: '3rem', textAlign: 'center', minHeight: '300px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🗺</p>
      <h3 style={{ marginBottom: '0.5rem' }}>Live Technician Map</h3>
      <p style={{ color: '#5f6368', fontSize: '0.9rem', maxWidth: '400px' }}>
        Real-time GPS tracking of {techs.filter(t => t.status !== 'off_duty').length} active technicians.
        Connect Google Maps API to enable live positioning.
      </p>
      <div style={{ marginTop: '1rem', display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
        {techs.filter(t => t.status !== 'off_duty').map(t => (
          <span key={t.id} style={{ background: '#fff', border: '1px solid #e0e0e0', borderRadius: '20px', padding: '0.3rem 0.75rem', fontSize: '0.8rem' }}>
            📍 {t.name} — {t.status.replace('_', ' ')}
          </span>
        ))}
      </div>
    </div>
  );
}
