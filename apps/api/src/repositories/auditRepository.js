const { makeId, now } = require('../services/id');

function createAuditRepository(store) {
  if (store.type === 'json') return createJsonAuditRepository(store);
  if (store.type === 'postgres') return createPostgresAuditRepository(store);
  throw new Error(`Unsupported store type: ${store.type}`);
}

function ensureAudit(data) {
  if (!data.auditEvents) data.auditEvents = [];
  return data;
}

function createJsonAuditRepository(store) {
  return {
    list(tenantId, limit = 100) {
      return ensureAudit(store.read()).auditEvents
        .filter(e => e.tenantId === tenantId)
        .slice(-limit)
        .reverse();
    },
    create(tenantId, input) {
      const data = ensureAudit(store.read());
      const event = {
        id: makeId('audit'),
        tenantId,
        eventType: input.eventType || 'activity',
        actorType: input.actorType || 'system',
        actorId: input.actorId || '',
        entityType: input.entityType || '',
        entityId: input.entityId || '',
        action: input.action || '',
        route: input.route || '',
        method: input.method || '',
        statusCode: Number(input.statusCode || 0),
        durationMs: Number(input.durationMs || 0),
        metadata: input.metadata || {},
        createdAt: input.createdAt || now()
      };
      data.auditEvents.push(event);
      store.write(data);
      return event;
    }
  };
}

function createPostgresAuditRepository(store) {
  return {
    async list(tenantId, limit = 100) {
      const result = await store.query(
        `SELECT id::text, tenant_id as "tenantId", event_type as "eventType",
                actor_type as "actorType", actor_id as "actorId",
                entity_type as "entityType", entity_id as "entityId", action,
                route, method, status_code as "statusCode", duration_ms as "durationMs",
                metadata, created_at as "createdAt"
         FROM audit_events
         WHERE tenant_id = $1
         ORDER BY created_at DESC
         LIMIT $2`,
        [tenantId, limit]
      );
      return result.rows;
    },
    async create(tenantId, input) {
      const result = await store.query(
        `INSERT INTO audit_events
         (tenant_id, event_type, actor_type, actor_id, entity_type, entity_id, action, route, method, status_code, duration_ms, metadata)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12::jsonb)
         RETURNING id::text, tenant_id as "tenantId", event_type as "eventType",
                   actor_type as "actorType", actor_id as "actorId",
                   entity_type as "entityType", entity_id as "entityId", action,
                   route, method, status_code as "statusCode", duration_ms as "durationMs",
                   metadata, created_at as "createdAt"`,
        [
          tenantId,
          input.eventType || 'activity',
          input.actorType || 'system',
          input.actorId || '',
          input.entityType || '',
          input.entityId || '',
          input.action || '',
          input.route || '',
          input.method || '',
          Number(input.statusCode || 0),
          Number(input.durationMs || 0),
          JSON.stringify(input.metadata || {})
        ]
      );
      return result.rows[0];
    }
  };
}

module.exports = { createAuditRepository };
