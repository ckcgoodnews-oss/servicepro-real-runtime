function createAuthEventRepository(store) {
  if (store.type === 'json') return createJsonAuthEventRepository(store);
  if (store.type === 'postgres') return createPostgresAuthEventRepository(store);
  throw new Error(`Unsupported store type: ${store.type}`);
}

function ensureAuthEvents(data) {
  if (!data.authEvents) data.authEvents = [];
  return data;
}

function createJsonAuthEventRepository(store) {
  return {
    async log(event) {
      const data = ensureAuthEvents(store.read());
      const record = {
        id: `authevt_${Math.random().toString(36).slice(2, 10)}`,
        tenantId: event.tenantId || '',
        userId: event.userId || '',
        eventType: event.eventType,
        email: event.email || '',
        status: event.status || 'success',
        createdAt: new Date().toISOString()
      };
      data.authEvents.push(record);
      store.write(data);
      return record;
    },
    async list(tenantId) {
      const data = ensureAuthEvents(store.read());
      return data.authEvents.filter(e => e.tenantId === tenantId);
    }
  };
}

function createPostgresAuthEventRepository(store) {
  return {
    async log(event) {
      const result = await store.query(
        `INSERT INTO runtime_auth_events (tenant_id, user_id, event_type, email, status)
         VALUES ($1, NULLIF($2, '')::uuid, $3, $4, $5)
         RETURNING id::text, tenant_id as "tenantId", user_id::text as "userId",
                   event_type as "eventType", email, status, created_at as "createdAt"`,
        [event.tenantId || null, event.userId || '', event.eventType, event.email || '', event.status || 'success']
      );
      return result.rows[0];
    },
    async list(tenantId) {
      const result = await store.query(
        `SELECT id::text, tenant_id as "tenantId", user_id::text as "userId",
                event_type as "eventType", email, status, created_at as "createdAt"
         FROM runtime_auth_events
         WHERE tenant_id = $1
         ORDER BY created_at DESC`,
        [tenantId]
      );
      return result.rows;
    }
  };
}

module.exports = { createAuthEventRepository };
