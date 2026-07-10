const { makeId, now } = require('../services/id');

function createSecurityEventRepository(store) {
  if (store.type === 'json') return createJsonSecurityEventRepository(store);
  if (store.type === 'postgres') return createPostgresSecurityEventRepository(store);
  throw new Error(`Unsupported store type: ${store.type}`);
}

function ensureEvents(data) {
  if (!data.securityEvents) data.securityEvents = [];
  return data;
}

function createJsonSecurityEventRepository(store) {
  return {
    list(tenantId, limit = 100) {
      return ensureEvents(store.read()).securityEvents
        .filter(e => e.tenantId === tenantId)
        .slice(-limit)
        .reverse();
    },
    create(tenantId, input) {
      const data = ensureEvents(store.read());
      const event = {
        id: makeId('sec'),
        tenantId,
        eventType: input.eventType || 'security.event',
        subject: input.subject || '',
        severity: input.severity || 'info',
        metadata: input.metadata || {},
        createdAt: now()
      };
      data.securityEvents.push(event);
      store.write(data);
      return event;
    }
  };
}

function createPostgresSecurityEventRepository(store) {
  return {
    async list(tenantId, limit = 100) {
      const result = await store.query(
        `SELECT id::text, tenant_id as "tenantId", event_type as "eventType", subject,
                severity, metadata, created_at as "createdAt"
         FROM security_events
         WHERE tenant_id = $1
         ORDER BY created_at DESC
         LIMIT $2`,
        [tenantId, limit]
      );
      return result.rows;
    },
    async create(tenantId, input) {
      const result = await store.query(
        `INSERT INTO security_events (tenant_id, event_type, subject, severity, metadata)
         VALUES ($1, $2, $3, $4, $5::jsonb)
         RETURNING id::text, tenant_id as "tenantId", event_type as "eventType", subject,
                   severity, metadata, created_at as "createdAt"`,
        [tenantId, input.eventType || 'security.event', input.subject || '', input.severity || 'info', JSON.stringify(input.metadata || {})]
      );
      return result.rows[0];
    }
  };
}

module.exports = { createSecurityEventRepository };
