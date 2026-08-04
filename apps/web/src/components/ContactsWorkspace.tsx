'use client';

import { useState, useEffect } from 'react';
import { contactsApi } from '@/lib/api';

type Contact = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  mobile: string;
  jobTitle: string;
  companyId: string | null;
  lifecycleStage: string;
  ownerId: string | null;
  source: string;
  tags: string[];
  createdAt: string;
};

const lifecycleStages = ['subscriber', 'lead', 'mql', 'sql', 'opportunity', 'customer', 'evangelist'];
const stageColors: Record<string, string> = {
  subscriber: '#c4c4c4', lead: '#579bfc', mql: '#a25ddc', sql: '#fdab3d',
  opportunity: '#e67c00', customer: '#00c875', evangelist: '#ff5ac4'
};

export function ContactsWorkspace() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [stageFilter, setStageFilter] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [showMerge, setShowMerge] = useState(false);
  const [mergeTarget, setMergeTarget] = useState<{ primary: Contact | null; duplicate: Contact | null }>({ primary: null, duplicate: null });
  const [form, setForm] = useState({ first_name: '', last_name: '', email: '', phone: '', source: 'manual', lifecycle_stage: 'subscriber' });

  useEffect(() => {
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (stageFilter) params.set('lifecycle_stage', stageFilter);
    contactsApi.list(params.toString()).then(r => setContacts((r.data || []) as Contact[]))
      .finally(() => setLoading(false));
  }, [search, stageFilter]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    const result = await contactsApi.create({ ...form, force_create: true });
    if (result.data) { setContacts(prev => [result.data as Contact, ...prev]); setShowCreate(false); setForm({ first_name: '', last_name: '', email: '', phone: '', source: 'manual', lifecycle_stage: 'subscriber' }); }
  }

  async function handleMerge() {
    if (!mergeTarget.primary || !mergeTarget.duplicate) return;
    const result = await contactsApi.merge({ primary_id: mergeTarget.primary.id, duplicate_id: mergeTarget.duplicate.id });
    if (result.data) {
      setContacts(prev => prev.filter(c => c.id !== mergeTarget.duplicate!.id));
      setShowMerge(false); setMergeTarget({ primary: null, duplicate: null });
    }
  }

  async function handleLifecycleChange(id: string, stage: string) {
    const result = await contactsApi.update(id, { lifecycle_stage: stage });
    if (result.data) setContacts(prev => prev.map(c => c.id === id ? { ...c, ...result.data as Contact } : c));
  }

  if (loading) return <div className="workspace-loading" aria-busy="true"><p>Loading contacts...</p></div>;

  return (
    <div className="contacts-workspace">
      <header className="workspace-header">
        <h1>Contacts</h1>
        <div className="workspace-actions">
          <button className="btn-secondary" onClick={() => setShowMerge(true)}>Merge Duplicates</button>
          <button className="btn-primary" onClick={() => setShowCreate(true)}>+ New Contact</button>
        </div>
      </header>

      {/* Lifecycle Stage Summary */}
      <div className="lifecycle-bar" role="region" aria-label="Contacts by lifecycle stage">
        {lifecycleStages.map(stage => {
          const count = contacts.filter(c => c.lifecycleStage === stage).length;
          return (
            <button key={stage} className={`lifecycle-chip ${stageFilter === stage ? 'active' : ''}`}
              style={{ borderColor: stageColors[stage] }}
              onClick={() => setStageFilter(stageFilter === stage ? '' : stage)}
              aria-pressed={stageFilter === stage}>
              {stage} ({count})
            </button>
          );
        })}
      </div>

      {/* Search */}
      <div className="contacts-search">
        <input type="search" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search contacts by name, email, or phone..." aria-label="Search contacts" />
      </div>

      {/* Contacts Table */}
      <table className="data-table" role="grid" aria-label="Contacts">
        <thead><tr><th>Name</th><th>Email</th><th>Phone</th><th>Job Title</th><th>Lifecycle</th><th>Source</th><th>Created</th></tr></thead>
        <tbody>
          {contacts.map(contact => (
            <tr key={contact.id}>
              <td><strong>{contact.firstName} {contact.lastName}</strong></td>
              <td>{contact.email || '—'}</td>
              <td>{contact.phone || contact.mobile || '—'}</td>
              <td>{contact.jobTitle || '—'}</td>
              <td>
                <select value={contact.lifecycleStage} onChange={e => handleLifecycleChange(contact.id, e.target.value)}
                  style={{ color: stageColors[contact.lifecycleStage] }} aria-label={`Lifecycle for ${contact.firstName}`}>
                  {lifecycleStages.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </td>
              <td>{contact.source || '—'}</td>
              <td>{new Date(contact.createdAt).toLocaleDateString()}</td>
            </tr>
          ))}
          {contacts.length === 0 && <tr><td colSpan={7} className="empty-state">No contacts found</td></tr>}
        </tbody>
      </table>

      {/* Create Contact */}
      {showCreate && (
        <dialog open className="modal" aria-labelledby="create-contact-title">
          <form onSubmit={handleCreate}>
            <h2 id="create-contact-title">New Contact</h2>
            <div className="form-row">
              <label>First Name <input required value={form.first_name} onChange={e => setForm(f => ({ ...f, first_name: e.target.value }))} /></label>
              <label>Last Name <input value={form.last_name} onChange={e => setForm(f => ({ ...f, last_name: e.target.value }))} /></label>
            </div>
            <label>Email <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} /></label>
            <label>Phone <input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} /></label>
            <label>Lifecycle Stage <select value={form.lifecycle_stage} onChange={e => setForm(f => ({ ...f, lifecycle_stage: e.target.value }))}>{lifecycleStages.map(s => <option key={s} value={s}>{s}</option>)}</select></label>
            <label>Source <input value={form.source} onChange={e => setForm(f => ({ ...f, source: e.target.value }))} /></label>
            <div className="modal-actions"><button type="submit" className="btn-primary">Create</button><button type="button" onClick={() => setShowCreate(false)}>Cancel</button></div>
          </form>
        </dialog>
      )}

      {/* Merge Duplicates */}
      {showMerge && (
        <dialog open className="modal" aria-labelledby="merge-title">
          <h2 id="merge-title">Merge Duplicate Contacts</h2>
          <p>Select the primary contact (survives) and the duplicate (will be merged into primary).</p>
          <label>Primary Contact
            <select value={mergeTarget.primary?.id || ''} onChange={e => setMergeTarget(m => ({ ...m, primary: contacts.find(c => c.id === e.target.value) || null }))}>
              <option value="">Select...</option>
              {contacts.map(c => <option key={c.id} value={c.id}>{c.firstName} {c.lastName} ({c.email})</option>)}
            </select>
          </label>
          <label>Duplicate Contact
            <select value={mergeTarget.duplicate?.id || ''} onChange={e => setMergeTarget(m => ({ ...m, duplicate: contacts.find(c => c.id === e.target.value) || null }))}>
              <option value="">Select...</option>
              {contacts.filter(c => c.id !== mergeTarget.primary?.id).map(c => <option key={c.id} value={c.id}>{c.firstName} {c.lastName} ({c.email})</option>)}
            </select>
          </label>
          <div className="modal-actions"><button className="btn-primary" onClick={handleMerge} disabled={!mergeTarget.primary || !mergeTarget.duplicate}>Merge</button><button onClick={() => setShowMerge(false)}>Cancel</button></div>
        </dialog>
      )}
    </div>
  );
}
