'use client';

import { MobileShell } from '@/components/MobileShell';

export default function SchedulePage() {
  const days = ['Mon 7/21', 'Tue 7/22', 'Wed 7/23', 'Thu 7/24', 'Fri 7/25'];
  const jobs = [
    { day: 0, time: '8:00', title: 'AC Maintenance', customer: 'Rivera Office' },
    { day: 0, time: '10:30', title: 'Thermostat Install', customer: 'Chen Home' },
    { day: 1, time: '9:00', title: 'Pipe Repair', customer: 'Thompson' },
    { day: 1, time: '1:00', title: 'Water Heater', customer: 'Park Family' },
    { day: 2, time: '8:00', title: 'Emergency Call', customer: 'Wilson Corp' },
    { day: 3, time: '10:00', title: 'Drain Cleaning', customer: 'Sunrise Cafe' },
    { day: 4, time: '9:00', title: 'Inspection', customer: 'Garcia Home' },
    { day: 4, time: '2:00', title: 'Follow-up', customer: 'Lee Apt' },
  ];

  return (
    <MobileShell activePath="/schedule" title="Schedule">
      <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', marginBottom: '1rem', paddingBottom: '0.5rem' }}>
        {days.map((d, i) => (
          <div key={i} style={{ minWidth: '80px', textAlign: 'center', padding: '0.5rem', borderRadius: '8px', background: i === 4 ? 'var(--primary)' : 'var(--surface)', color: i === 4 ? '#fff' : 'var(--text)', fontSize: '0.75rem', fontWeight: 500 }}>
            {d}
            <p style={{ fontSize: '1.1rem', fontWeight: 700, marginTop: '0.2rem' }}>{jobs.filter(j => j.day === i).length}</p>
          </div>
        ))}
      </div>
      <h3 style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>This Week</h3>
      {days.map((day, i) => {
        const dayJobs = jobs.filter(j => j.day === i);
        if (!dayJobs.length) return null;
        return (
          <div key={i} style={{ marginBottom: '1rem' }}>
            <p style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.3rem' }}>{day}</p>
            {dayJobs.map((j, idx) => (
              <div key={idx} className="m-card" style={{ padding: '0.75rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <strong style={{ fontSize: '0.85rem' }}>{j.title}</strong>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{j.time}</span>
                </div>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{j.customer}</p>
              </div>
            ))}
          </div>
        );
      })}
    </MobileShell>
  );
}
