'use client';

import { MobileShell } from '@/components/MobileShell';
import { useState } from 'react';

export default function ClockPage() {
  const [clockedIn, setClockedIn] = useState(true);
  const [clockInTime] = useState('7:45 AM');

  const timeEntries = [
    { date: 'Today', clockIn: '7:45 AM', clockOut: '—', hours: '—', status: 'active' },
    { date: 'Thu 7/24', clockIn: '7:30 AM', clockOut: '4:15 PM', hours: '8.75', status: 'complete' },
    { date: 'Wed 7/23', clockIn: '8:00 AM', clockOut: '5:00 PM', hours: '9.0', status: 'complete' },
    { date: 'Tue 7/22', clockIn: '7:45 AM', clockOut: '4:30 PM', hours: '8.75', status: 'complete' },
    { date: 'Mon 7/21', clockIn: '8:00 AM', clockOut: '4:00 PM', hours: '8.0', status: 'complete' },
  ];

  return (
    <MobileShell activePath="/clock" title="Time Clock">
      <div className="m-card" style={{ textAlign: 'center', padding: '1.5rem' }}>
        <p style={{ fontSize: '0.8rem', color: clockedIn ? 'var(--success)' : 'var(--text-muted)', fontWeight: 600, marginBottom: '0.5rem' }}>
          {clockedIn ? '● Clocked In' : '○ Clocked Out'}
        </p>
        {clockedIn && <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Since {clockInTime}</p>}
        <button className={clockedIn ? 'm-btn m-btn-danger' : 'm-btn m-btn-success'} style={{ marginTop: '1rem' }} onClick={() => setClockedIn(!clockedIn)}>
          {clockedIn ? 'Clock Out' : 'Clock In'}
        </button>
      </div>

      <div className="m-card" style={{ display: 'flex', justifyContent: 'space-around', textAlign: 'center' }}>
        <div><p style={{ fontSize: '1.2rem', fontWeight: 700 }}>34.5</p><p style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Hours This Week</p></div>
        <div><p style={{ fontSize: '1.2rem', fontWeight: 700 }}>4</p><p style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Days Worked</p></div>
        <div><p style={{ fontSize: '1.2rem', fontWeight: 700 }}>0</p><p style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Overtime</p></div>
      </div>

      <h3 style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '1rem 0 0.5rem' }}>Time Entries</h3>
      {timeEntries.map((entry, i) => (
        <div key={i} className="m-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <p style={{ fontWeight: 500, fontSize: '0.85rem' }}>{entry.date}</p>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{entry.clockIn} — {entry.clockOut}</p>
          </div>
          <span style={{ fontSize: '0.9rem', fontWeight: 600, color: entry.status === 'active' ? 'var(--success)' : 'var(--text)' }}>
            {entry.hours === '—' ? '●' : `${entry.hours}h`}
          </span>
        </div>
      ))}
    </MobileShell>
  );
}
