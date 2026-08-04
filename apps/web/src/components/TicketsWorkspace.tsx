'use client';

import { useState, useEffect, useMemo } from 'react';
import { ticketsApi } from '@/lib/api';

type Ticket = {
  id: string;
  ticketNumber: number;
  subject: string;
  description: string;
  status: string;
  priority: string;
  category: string | null;
  channel: string;
  assignedTo: string | null;
  customerId: string | null;
  equipmentId: string | null;
  satisfactionScore: number | null;
  createdAt: string;
  updatedAt: string;
};

type Comment = { id: string; authorId: string; authorType: string; content: string; isInternal: boolean; createdAt: string };

const priorityColors: Record<string, string> = { urgent: '#e2445c', high: '#fdab3d', medium: '#579bfc', low: '#c4c4c4' };
const statusLabels: Record<string, string> = { new: 'New', in_progress: 'In Progress', waiting: 'Waiting', resolved: 'Resolved', closed: 'Closed' };

export function TicketsWorkspace() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [metrics, setMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isInternal, setIsInternal] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [filter, setFilter] = useState({ status: '', priority: '' });
  const [form, setForm] = useState({ subject: '', description: '', priority: 'medium', category: '', channel: 'portal' });

  useEffect(() => {
    const params = new URLSearchParams();
    if (filter.status) params.set('status', filter.status);
    if (filter.priority) params.set('priority', filter.priority);
    Promise.all([
      ticketsApi.list(params.toString()).then(r => r.data || []),
      ticketsApi.metrics().then(r => r.data || null),
    ]).then(([t, m]) => { setTickets(t as Ticket[]); setMetrics(m); })
      .finally(() => setLoading(false));
  }, [filter]);

  async function selectTicket(ticket: Ticket) {
    setSelectedTicket(ticket);
    const result = await ticketsApi.listComments(ticket.id);
    setComments((result.data || []) as Comment[]);
  }

  async function handleAddComment(e: React.FormEvent) {
    e.preventDefault();
    if (!newComment.trim() || !selectedTicket) return;
    const result = await ticketsApi.addComment(selectedTicket.id, { content: newComment, is_internal: isInternal, author_type: 'agent' });
    if (result.data) { setComments(prev => [...prev, result.data as Comment]); setNewComment(''); }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    const result = await ticketsApi.create(form);
    if (result.data) { setTickets(prev => [result.data as Ticket, ...prev]); setShowCreate(false); setForm({ subject: '', description: '', priority: 'medium', category: '', channel: 'portal' }); }
  }

  async function handleStatusChange(ticketId: string, status: string) {
    const result = await ticketsApi.update(ticketId, { status });
    if (result.data) {
      setTickets(prev => prev.map(t => t.id === ticketId ? { ...t, ...result.data as Ticket } : t));
      if (selectedTicket?.id === ticketId) setSelectedTicket({ ...selectedTicket, ...result.data as Ticket });
    }
  }

  if (loading) return <div className="workspace-loading" aria-busy="true"><p>Loading tickets...</p></div>;

  return (
    <div className="tickets-workspace">
      <header className="workspace-header">
        <h1>Service Desk</h1>
        <div className="workspace-actions">
          <button className="btn-primary" onClick={() => setShowCreate(true)}>+ New Ticket</button>
        </div>
      </header>

      {/* Metrics Bar */}
      {metrics && (
        <div className="tickets-metrics-bar" role="region" aria-label="Ticket metrics">
          <div className="metric-card"><span className="metric-value">{metrics.total}</span><span className="metric-label">Total</span></div>
          <div className="metric-card"><span className="metric-value">{metrics.open}</span><span className="metric-label">Open</span></div>
          <div className="metric-card"><span className="metric-value">{metrics.byPriority?.urgent || 0}</span><span className="metric-label">Urgent</span></div>
          <div className="metric-card"><span className="metric-value">{metrics.avgSatisfaction?.toFixed(1) || '—'}</span><span className="metric-label">CSAT</span></div>
        </div>
      )}

      {/* Filters */}
      <div className="tickets-filters" role="search" aria-label="Filter tickets">
        <select value={filter.status} onChange={e => setFilter(f => ({ ...f, status: e.target.value }))} aria-label="Filter by status">
          <option value="">All Statuses</option>
          {Object.entries(statusLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
        <select value={filter.priority} onChange={e => setFilter(f => ({ ...f, priority: e.target.value }))} aria-label="Filter by priority">
          <option value="">All Priorities</option>
          <option value="urgent">Urgent</option><option value="high">High</option><option value="medium">Medium</option><option value="low">Low</option>
        </select>
      </div>

      <div className="tickets-layout">
        {/* Ticket List */}
        <div className="tickets-list" role="list" aria-label="Tickets">
          {tickets.map(ticket => (
            <article key={ticket.id} className={`ticket-row ${selectedTicket?.id === ticket.id ? 'selected' : ''}`} onClick={() => selectTicket(ticket)} role="listitem" tabIndex={0} onKeyDown={e => e.key === 'Enter' && selectTicket(ticket)}>
              <div className="ticket-priority-indicator" style={{ backgroundColor: priorityColors[ticket.priority] }} aria-label={`Priority: ${ticket.priority}`} />
              <div className="ticket-row-content">
                <div className="ticket-row-header">
                  <span className="ticket-number">#{ticket.ticketNumber}</span>
                  <span className={`status-badge status-${ticket.status}`}>{statusLabels[ticket.status] || ticket.status}</span>
                </div>
                <h3 className="ticket-subject">{ticket.subject}</h3>
                <div className="ticket-meta">{ticket.channel} · {ticket.category || 'General'} · {new Date(ticket.createdAt).toLocaleDateString()}</div>
              </div>
            </article>
          ))}
          {tickets.length === 0 && <p className="empty-state">No tickets found</p>}
        </div>

        {/* Ticket Detail */}
        {selectedTicket && (
          <aside className="ticket-detail" aria-label={`Ticket #${selectedTicket.ticketNumber} details`}>
            <div className="ticket-detail-header">
              <h2>#{selectedTicket.ticketNumber}: {selectedTicket.subject}</h2>
              <select value={selectedTicket.status} onChange={e => handleStatusChange(selectedTicket.id, e.target.value)} aria-label="Change status">
                {Object.entries(statusLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>
            <div className="ticket-detail-body">
              <p>{selectedTicket.description || 'No description provided.'}</p>
              <div className="ticket-properties">
                <span><strong>Priority:</strong> {selectedTicket.priority}</span>
                <span><strong>Channel:</strong> {selectedTicket.channel}</span>
                <span><strong>Assigned:</strong> {selectedTicket.assignedTo || 'Unassigned'}</span>
              </div>
            </div>

            {/* Comments Thread */}
            <div className="ticket-comments" role="log" aria-label="Conversation">
              <h3>Conversation</h3>
              {comments.map(c => (
                <div key={c.id} className={`comment ${c.isInternal ? 'comment-internal' : ''} comment-${c.authorType}`}>
                  <div className="comment-header">
                    <span className="comment-author">{c.authorType === 'customer' ? '👤 Customer' : c.isInternal ? '🔒 Internal' : '🎧 Agent'}</span>
                    <time>{new Date(c.createdAt).toLocaleString()}</time>
                  </div>
                  <p>{c.content}</p>
                </div>
              ))}
              <form onSubmit={handleAddComment} className="comment-form">
                <textarea value={newComment} onChange={e => setNewComment(e.target.value)} placeholder="Add a reply..." required aria-label="Reply content" />
                <div className="comment-form-actions">
                  <label className="checkbox-label"><input type="checkbox" checked={isInternal} onChange={e => setIsInternal(e.target.checked)} /> Internal note</label>
                  <button type="submit" className="btn-primary" disabled={!newComment.trim()}>Send</button>
                </div>
              </form>
            </div>
          </aside>
        )}
      </div>

      {/* Create Ticket Modal */}
      {showCreate && (
        <dialog open className="modal" aria-labelledby="create-ticket-title">
          <form onSubmit={handleCreate}>
            <h2 id="create-ticket-title">New Ticket</h2>
            <label>Subject <input required value={form.subject} onChange={e => setForm(f => ({ ...f, subject: e.target.value }))} /></label>
            <label>Description <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} /></label>
            <label>Priority <select value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value }))}><option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option><option value="urgent">Urgent</option></select></label>
            <label>Category <input value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} placeholder="e.g. HVAC, Plumbing" /></label>
            <div className="modal-actions"><button type="submit" className="btn-primary">Create</button><button type="button" onClick={() => setShowCreate(false)}>Cancel</button></div>
          </form>
        </dialog>
      )}
    </div>
  );
}
