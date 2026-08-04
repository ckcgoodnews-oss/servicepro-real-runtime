const { makeId, now } = require('../services/id');

function createCallLogRepository(store) {
  if (store.type === 'json') return createJsonImpl(store);
  if (store.type === 'postgres') return createPostgresImpl(store);
  throw new Error(`Unsupported store type: ${store.type}`);
}

function createJsonImpl(store) {
  function data() { return store.read(); }
  function save(d) { store.write(d); }

  return {
    list(tenantId, filters = {}) {
      const d = data(); d.callLogs ||= [];
      let r = d.callLogs.filter(c => c.tenantId === tenantId);
      if (filters.contact_id) r = r.filter(c => c.contactId === filters.contact_id);
      if (filters.deal_id) r = r.filter(c => c.dealId === filters.deal_id);
      if (filters.caller_id) r = r.filter(c => c.callerId === filters.caller_id);
      if (filters.direction) r = r.filter(c => c.direction === filters.direction);
      if (filters.outcome) r = r.filter(c => c.outcome === filters.outcome);
      return r.sort((a, b) => (b.startedAt || '').localeCompare(a.startedAt || ''));
    },

    findById(tenantId, id) {
      const d = data(); d.callLogs ||= [];
      return d.callLogs.find(c => c.tenantId === tenantId && c.id === id) || null;
    },

    create(tenantId, input) {
      const d = data(); d.callLogs ||= [];
      const log = {
        id: makeId('call'), tenantId, callerId: input.caller_id,
        contactId: input.contact_id || null, dealId: input.deal_id || null,
        direction: input.direction || 'outbound', outcome: input.outcome || 'connected',
        durationSeconds: input.duration_seconds || 0, notes: input.notes || '',
        recordingUrl: input.recording_url || null,
        recordingConsent: !!input.recording_consent,
        summary: input.summary || null, followUpTaskId: input.follow_up_task_id || null,
        startedAt: input.started_at || now(), endedAt: input.ended_at || null, createdAt: now()
      };
      d.callLogs.push(log); save(d); return log;
    },

    update(tenantId, id, input) {
      const d = data(); d.callLogs ||= [];
      const idx = d.callLogs.findIndex(c => c.tenantId === tenantId && c.id === id);
      if (idx === -1) return null;
      const log = d.callLogs[idx];
      if (input.outcome !== undefined) log.outcome = input.outcome;
      if (input.duration_seconds !== undefined) log.durationSeconds = input.duration_seconds;
      if (input.notes !== undefined) log.notes = input.notes;
      if (input.summary !== undefined) log.summary = input.summary;
      if (input.ended_at !== undefined) log.endedAt = input.ended_at;
      if (input.follow_up_task_id !== undefined) log.followUpTaskId = input.follow_up_task_id;
      save(d); return log;
    },

    stats(tenantId, filters = {}) {
      const d = data(); d.callLogs ||= [];
      let r = d.callLogs.filter(c => c.tenantId === tenantId);
      if (filters.caller_id) r = r.filter(c => c.callerId === filters.caller_id);
      const total = r.length;
      const connected = r.filter(c => c.outcome === 'connected').length;
      const totalDuration = r.reduce((sum, c) => sum + (c.durationSeconds || 0), 0);
      const byOutcome = {};
      for (const c of r) byOutcome[c.outcome] = (byOutcome[c.outcome] || 0) + 1;
      return { total, connected, connect_rate: total ? parseFloat((connected / total * 100).toFixed(1)) : 0, total_duration_seconds: totalDuration, avg_duration_seconds: total ? Math.round(totalDuration / total) : 0, byOutcome };
    }
  };
}

function createPostgresImpl(store) { return createJsonImpl(store); }
module.exports = { createCallLogRepository };
