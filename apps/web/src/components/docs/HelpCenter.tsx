'use client';

import { useState } from 'react';
import { volumes, type Volume, type Chapter } from './documentationData';

type ViewMode = 'library' | 'volume' | 'chapter';

export function HelpCenter() {
  const [viewMode, setViewMode] = useState<ViewMode>('library');
  const [selectedVolume, setSelectedVolume] = useState<Volume | null>(null);
  const [selectedChapter, setSelectedChapter] = useState<Chapter | null>(null);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');

  const filteredVolumes = volumes.filter(v => {
    if (roleFilter !== 'all' && !v.roles.includes(roleFilter)) return false;
    if (search) {
      const q = search.toLowerCase();
      return v.title.toLowerCase().includes(q) || v.description.toLowerCase().includes(q) ||
        v.chapters.some(c => c.title.toLowerCase().includes(q) || c.content.toLowerCase().includes(q));
    }
    return true;
  });

  function openVolume(v: Volume) { setSelectedVolume(v); setSelectedChapter(null); setViewMode('volume'); }
  function openChapter(c: Chapter) { setSelectedChapter(c); setViewMode('chapter'); }
  function goBack() {
    if (viewMode === 'chapter') { setSelectedChapter(null); setViewMode('volume'); }
    else { setSelectedVolume(null); setViewMode('library'); }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Search & Filter Bar */}
      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search all documentation..." style={{ flex: 1, minWidth: '250px', padding: '0.6rem 1rem', border: '1px solid #e0e0e0', borderRadius: '8px', fontSize: '0.9rem' }} />
        <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)} style={{ padding: '0.6rem', border: '1px solid #e0e0e0', borderRadius: '8px', fontSize: '0.85rem' }}>
          <option value="all">All Roles</option>
          <option value="customer">Customer</option>
          <option value="technician">Technician / Employee</option>
          <option value="dispatcher">Dispatcher</option>
          <option value="office">Office Staff</option>
          <option value="manager">Manager</option>
          <option value="admin">Company Administrator</option>
          <option value="platform_admin">Platform Administrator</option>
          <option value="developer">Developer</option>
        </select>
      </div>

      {/* Breadcrumb */}
      {viewMode !== 'library' && (
        <div style={{ fontSize: '0.85rem', color: '#5f6368' }}>
          <button onClick={() => { setViewMode('library'); setSelectedVolume(null); }} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#1a73e8' }}>Documentation Library</button>
          {selectedVolume && <span> / <button onClick={() => { setViewMode('volume'); setSelectedChapter(null); }} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#1a73e8' }}>{selectedVolume.title}</button></span>}
          {selectedChapter && <span> / {selectedChapter.title}</span>}
        </div>
      )}

      {/* Library View */}
      {viewMode === 'library' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1rem' }}>
          {filteredVolumes.map(v => (
            <div key={v.id} onClick={() => openVolume(v)} style={{ background: '#fff', border: '1px solid #e0e0e0', borderRadius: '10px', padding: '1.25rem', cursor: 'pointer', transition: 'box-shadow 0.2s', borderLeft: `4px solid ${v.color}` }} onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.08)')} onMouseLeave={e => (e.currentTarget.style.boxShadow = 'none')}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <span style={{ fontSize: '1.5rem' }}>{v.icon}</span>
                <span style={{ fontSize: '0.65rem', padding: '2px 6px', borderRadius: '4px', background: '#f1f3f4', color: '#5f6368' }}>Vol. {v.volumeNumber}</span>
              </div>
              <h3 style={{ fontSize: '1rem', marginTop: '0.75rem', marginBottom: '0.25rem' }}>{v.title}</h3>
              <p style={{ fontSize: '0.8rem', color: '#5f6368', lineHeight: 1.4 }}>{v.description}</p>
              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.75rem', fontSize: '0.7rem', color: '#9e9e9e' }}>
                <span>📖 {v.chapters.length} chapters</span>
                <span>⏱ {v.estimatedMinutes} min</span>
                <span>👤 {v.roles.join(', ')}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Volume View (Table of Contents) */}
      {viewMode === 'volume' && selectedVolume && (
        <div>
          <div style={{ background: '#fff', border: '1px solid #e0e0e0', borderRadius: '10px', padding: '1.5rem', marginBottom: '1rem', borderLeft: `4px solid ${selectedVolume.color}` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <span style={{ fontSize: '2rem' }}>{selectedVolume.icon}</span>
              <div>
                <h2 style={{ fontSize: '1.25rem' }}>{selectedVolume.title}</h2>
                <p style={{ fontSize: '0.85rem', color: '#5f6368' }}>{selectedVolume.description}</p>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '1rem', marginTop: '0.75rem', fontSize: '0.8rem', color: '#5f6368' }}>
              <span>📖 {selectedVolume.chapters.length} chapters</span>
              <span>⏱ ~{selectedVolume.estimatedMinutes} min total read</span>
              <span>👤 For: {selectedVolume.roles.join(', ')}</span>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {selectedVolume.chapters.map((ch, i) => (
              <div key={ch.id} onClick={() => openChapter(ch)} style={{ background: '#fff', border: '1px solid #e0e0e0', borderRadius: '8px', padding: '1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '1rem' }} onMouseEnter={e => (e.currentTarget.style.background = '#f8f9fa')} onMouseLeave={e => (e.currentTarget.style.background = '#fff')}>
                <span style={{ width: '28px', height: '28px', borderRadius: '50%', background: selectedVolume.color + '22', color: selectedVolume.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700, flexShrink: 0 }}>{i + 1}</span>
                <div style={{ flex: 1 }}>
                  <strong style={{ fontSize: '0.9rem' }}>{ch.title}</strong>
                  <p style={{ fontSize: '0.75rem', color: '#5f6368', marginTop: '0.15rem' }}>{ch.summary}</p>
                </div>
                <span style={{ fontSize: '0.7rem', color: '#9e9e9e' }}>{ch.readMinutes} min</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Chapter View (Full Content) */}
      {viewMode === 'chapter' && selectedChapter && (
        <div style={{ background: '#fff', border: '1px solid #e0e0e0', borderRadius: '10px', padding: '2rem', maxWidth: '800px' }}>
          <button onClick={goBack} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#1a73e8', fontSize: '0.85rem', marginBottom: '1rem' }}>← Back to {selectedVolume?.title}</button>
          <h2 style={{ fontSize: '1.3rem', marginBottom: '0.5rem' }}>{selectedChapter.title}</h2>
          <p style={{ fontSize: '0.85rem', color: '#5f6368', marginBottom: '1.5rem' }}>{selectedChapter.summary}</p>
          <div style={{ fontSize: '0.9rem', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>{selectedChapter.content}</div>
          {selectedChapter.steps && selectedChapter.steps.length > 0 && (
            <div style={{ marginTop: '1.5rem', background: '#f8f9fa', borderRadius: '8px', padding: '1.25rem' }}>
              <h4 style={{ fontSize: '0.9rem', marginBottom: '0.75rem' }}>Step-by-Step Instructions</h4>
              <ol style={{ paddingLeft: '1.25rem', fontSize: '0.85rem', lineHeight: 1.8 }}>
                {selectedChapter.steps.map((step, i) => <li key={i} style={{ marginBottom: '0.4rem' }}>{step}</li>)}
              </ol>
            </div>
          )}
          {selectedChapter.tips && selectedChapter.tips.length > 0 && (
            <div style={{ marginTop: '1.25rem', background: '#e8f0fe', borderRadius: '8px', padding: '1rem' }}>
              <h4 style={{ fontSize: '0.85rem', color: '#1a73e8', marginBottom: '0.5rem' }}>💡 Tips & Best Practices</h4>
              <ul style={{ paddingLeft: '1rem', fontSize: '0.8rem', lineHeight: 1.7 }}>
                {selectedChapter.tips.map((tip, i) => <li key={i}>{tip}</li>)}
              </ul>
            </div>
          )}
          {selectedChapter.troubleshooting && selectedChapter.troubleshooting.length > 0 && (
            <div style={{ marginTop: '1.25rem', background: '#fef7e0', borderRadius: '8px', padding: '1rem' }}>
              <h4 style={{ fontSize: '0.85rem', color: '#b06000', marginBottom: '0.5rem' }}>⚠️ Troubleshooting</h4>
              <ul style={{ paddingLeft: '1rem', fontSize: '0.8rem', lineHeight: 1.7 }}>
                {selectedChapter.troubleshooting.map((item, i) => <li key={i}>{item}</li>)}
              </ul>
            </div>
          )}
          <div style={{ marginTop: '2rem', paddingTop: '1rem', borderTop: '1px solid #e0e0e0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8rem', color: '#9e9e9e' }}>Was this helpful?</span>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button style={{ padding: '0.3rem 0.8rem', border: '1px solid #e0e0e0', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem' }}>👍 Yes</button>
              <button style={{ padding: '0.3rem 0.8rem', border: '1px solid #e0e0e0', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem' }}>👎 No</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
