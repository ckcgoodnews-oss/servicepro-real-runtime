const { byTenant, insert, update } = require('../db/store');

function listWebhooks(tenantId) {
  return byTenant('webhooks', tenantId);
}

function createWebhook(tenantId, payload) {
  return insert('webhooks', {
    tenantId,
    name: payload.name,
    targetUrl: payload.targetUrl,
    events: String(payload.events || '').split(',').map(x => x.trim()).filter(Boolean),
    active: true
  });
}

function logDelivery(tenantId, webhookId, eventName, payload, status = 'queued') {
  return insert('webhookDeliveries', {
    tenantId,
    webhookId,
    eventName,
    payload,
    status,
    attempts: 0,
    lastError: ''
  });
}

function enqueueEvent(tenantId, eventName, payload) {
  const hooks = listWebhooks(tenantId).filter(h => h.active && (h.events.includes(eventName) || h.events.includes('*')));
  return hooks.map(h => logDelivery(tenantId, h.id, eventName, payload));
}

module.exports = { listWebhooks, createWebhook, logDelivery, enqueueEvent };
