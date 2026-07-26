'use client';

import { useState } from 'react';

type Job = {
  id: string;
  title: string;
  customer: string;
  address: string;
  time: string;
  duration: string;
  priority: 'normal' | 'high' | 'emergency';
  status: 'upcoming' | 'en_route' | 'arrived' | 'in_progress' | 'completed';
  notes: string;
};

const DEMO_JOBS: Job[] = [
  { id: 'j1', title: 'AC Maintenance', customer: 'Rivera Office Park', address: '880 Commerce Dr, Suite 200', time: '8:00 AM', duration: '1.5h', priority: 'normal', status: 'completed', notes: 'Annual filter change and coil cleaning' },
  { id: 'j2', title: 'Water Heater Install', customer: 'Park Family', address: '55 Maple St', time: '10:00 AM', duration: '3h', priority: 'high', status: 'in_progress', notes: '50gal tankless replacement. Parts on truck.' },
  { id: 'j3', title: 'Thermostat Replacement', customer: 'Garcia Home', address: '221 Pine Ave', time: '1:30 PM', duration: '1h', priority: 'normal', status: 'upcoming', notes: 'Customer wants WiFi thermostat. Ecobee in stock.' },
  { id: 'j4', title: 'Emergency Pipe Burst', customer: 'Thompson Residence', address: '142 Oak Lane', time: '3:00 PM', duration: '2h', priority: 'emergency', status: 'upcoming', notes: 'Active leak in basement. Shut-off needed.' },
];

const statusActions: Record<string, { label: string; next: Job['status']; style: string }> = {
  upcoming: { label: 'Start Route', next: 'en_route', style: 'm-btn m-btn-primary' },
  en_route: { label: 'Arrived', next: 'arrived', style: 'm-btn m-btn-primary' },
  arrived: { label: 'Start Work', next: 'in_progress', style: 'm-btn m-btn-primary' },
  in_progress: { label: 'Complete Job', next: 'completed', style: 'm-btn m-btn-success' },
  completed: { label: 'Completed ✓', next: 'completed', style: 'm-btn m-btn-outline' },
};

export function TodaysJobs() {
  const [jobs, setJobs] = useState(DEMO_JOBS);
  const completed = jobs.filter(j => j.status === 'completed').length;
  const current = jobs.find(j => j.status === 'in_progress' || j.status === 'en_route' || j.status === 'arrived');

  function advanceJob(jobId: string) {
    setJobs(prev => prev.map(j => {
      if (j.id !== jobId) return j;
      const action = statusActions[j.status];
      return { ...j, status: action.next };
    }));
  }

  return (
    <div>
      {/* Progress bar */}
      <div className="m-card" style={{ textAlign: 'center' }}>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Today&apos;s Progress</p>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ flex: 1, height: '8px', background: '#e0e0e0', borderRadius: '4px', overflow: 'hidden' }}>
            <div style={{ width: `${(completed / jobs.length) * 100}%`, height: '100%', background: 'var(--success)', borderRadius: '4px', transition: 'width 0.3s' }} />
          </div>
          <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{completed}/{jobs.length}</span>
        </div>
      </div>

      {/* Current Job Highlight */}
      {current && (
        <div className="m-card" style={{ border: '2px solid var(--primary)', marginBottom: '1rem' }}>
          <p style={{ fontSize: '0.7rem', color: 'var(--primary)', fontWeight: 600, textTransform: 'uppercase', marginBottom: '0.3rem' }}>Current Job</p>
          <h3 style={{ fontSize: '1rem', marginBottom: '0.25rem' }}>{current.title}</h3>
          <p style={{ fontSize: '0.85rem' }}>{current.customer}</p>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>📍 {current.address}</p>
          <button className={statusActions[current.status].style} style={{ marginTop: '0.75rem' }} onClick={() => advanceJob(current.id)}>
            {statusActions[current.status].label}
          </button>
        </div>
      )}

      {/* Job List */}
      <h3 style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>All Jobs</h3>
      {jobs.map(job => (
        <div key={job.id} className={`m-card job-card ${job.priority !== 'normal' ? `priority-${job.priority}` : ''}`}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <p style={{ fontWeight: 600, fontSize: '0.9rem' }}>{job.title}</p>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{job.customer}</p>
            </div>
            <span style={{ fontSize: '0.75rem', padding: '2px 8px', borderRadius: '4px', background: job.status === 'completed' ? '#e6f4ea' : job.status === 'in_progress' ? '#e8f0fe' : '#f5f5f5', color: job.status === 'completed' ? 'var(--success)' : job.status === 'in_progress' ? 'var(--primary)' : 'var(--text-muted)' }}>
              {job.status.replace('_', ' ')}
            </span>
          </div>
          <div style={{ display: 'flex', gap: '1rem', marginTop: '0.4rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            <span>⏰ {job.time}</span>
            <span>~{job.duration}</span>
            <span>📍 {job.address.split(',')[0]}</span>
          </div>
          {job.notes && <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.3rem', fontStyle: 'italic' }}>{job.notes}</p>}
          {job.status !== 'completed' && job.id !== current?.id && (
            <button className={statusActions[job.status].style} style={{ marginTop: '0.5rem', fontSize: '0.8rem', padding: '0.5rem' }} onClick={() => advanceJob(job.id)}>
              {statusActions[job.status].label}
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
