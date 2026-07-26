'use client';

import { useState, useEffect } from 'react';
import { technicianApi } from '@/lib/api';

type Technician = {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  status?: string;
  skills?: string[];
  certifications?: string[];
  rating?: number;
  completedJobs?: number;
};

const statusColors: Record<string, string> = { available: '#34a853', on_job: '#f9ab00', off_duty: '#9e9e9e', on_leave: '#5f6368' };

export function TechniciansView() {
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    technicianApi.list().then(res => {
      if (res.data) setTechnicians(res.data as Technician[]);
      setLoading(false);
    });
  }, []);

  if (loading) return <p>Loading technicians...</p>;

  const available = technicians.filter(t => t.status === 'available' || !t.status);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '0.75rem' }}>
        <Kpi label="Total Technicians" value={String(technicians.length)} color="#1a73e8" />
        <Kpi label="Available" value={String(available.length)} color="#34a853" />
        <Kpi label="On Job" value={String(technicians.filter(t => t.status === 'on_job').length)} color="#f9ab00" />
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <h3 style={{ fontSize: '0.95rem' }}>Team ({technicians.length})</h3>
        <button style={{ padding: '0.5rem 1rem', background: '#1a73e8', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem' }}>+ Add Technician</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '0.75rem' }}>
        {technicians.length === 0 && <p style={{ color: '#5f6368', gridColumn: '1/-1', textAlign: 'center', padding: '2rem' }}>No technicians yet</p>}
        {technicians.map(tech => (
          <div key={tech.id} style={{ background: '#fff', border: '1px solid #e0e0e0', borderRadius: '8px', padding: '1rem', borderLeft: `4px solid ${statusColors[tech.status || 'available'] || '#34a853'}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <strong style={{ fontSize: '0.9rem' }}>{tech.name}</strong>
                {tech.email && <p style={{ fontSize: '0.75rem', color: '#5f6368' }}>{tech.email}</p>}
              </div>
              <span style={{ fontSize: '0.7rem', padding: '2px 6px', borderRadius: '4px', background: (statusColors[tech.status || 'available'] || '#34a853') + '22', color: statusColors[tech.status || 'available'] || '#34a853' }}>
                {(tech.status || 'available').replace('_', ' ')}
              </span>
            </div>
            {tech.skills && tech.skills.length > 0 && (
              <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
                {tech.skills.map(s => <span key={s} style={{ fontSize: '0.65rem', padding: '1px 5px', background: '#e8f0fe', borderRadius: '3px', color: '#1a73e8' }}>{s}</span>)}
              </div>
            )}
            <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem', fontSize: '0.75rem', color: '#5f6368' }}>
              {tech.rating && <span>⭐ {tech.rating}</span>}
              {tech.completedJobs !== undefined && <span>{tech.completedJobs} jobs</span>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Kpi({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div style={{ background: '#fff', border: '1px solid #e0e0e0', borderRadius: '8px', padding: '0.75rem', textAlign: 'center' }}>
      <p style={{ fontSize: '1.4rem', fontWeight: 700, color }}>{value}</p>
      <p style={{ fontSize: '0.75rem', color: '#5f6368' }}>{label}</p>
    </div>
  );
}
