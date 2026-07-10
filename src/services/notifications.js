const store = require('../db');
const { v4: uuid } = require('uuid');

function now() { return new Date().toISOString(); }

async function queueNotification({ tenant_id, customer_id = null, channel, to, subject = '', body, related_type = '', related_id = '' }) {
  const row = {
    id: uuid(), tenant_id, customer_id, channel, to, subject, body,
    related_type, related_id, status: 'queued', attempts: 0,
    created_at: now(), sent_at: null, last_error: ''
  };
  await store.insert('notification_queue', row);
  return row;
}

async function markSent(id) {
  return store.update('notification_queue', n => n.id === id, { status: 'sent', sent_at: now(), attempts: 1 });
}

async function markFailed(id, error) {
  return store.update('notification_queue', n => n.id === id, row => ({ status: 'failed', attempts: Number(row.attempts || 0) + 1, last_error: String(error || '') }));
}

module.exports = { queueNotification, markSent, markFailed };
