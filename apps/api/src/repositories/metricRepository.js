const { makeId, now } = require('../services/id');

function createMetricRepository(store) {
  if (store.type === 'json') return createJsonMetricRepository(store);
  if (store.type === 'postgres') return createPostgresMetricRepository(store);
  throw new Error(`Unsupported store type: ${store.type}`);
}

function ensureMetrics(data) {
  if (!data.requestMetrics) data.requestMetrics = [];
  return data;
}

function summarize(rows) {
  const totalRequests = rows.length;
  const errorCount = rows.filter(row => Number(row.statusCode || 0) >= 500).length;
  const clientErrorCount = rows.filter(row => Number(row.statusCode || 0) >= 400 && Number(row.statusCode || 0) < 500).length;
  const durations = rows.map(row => Number(row.durationMs || 0));
  const avgDurationMs = totalRequests ? Math.round(durations.reduce((a, b) => a + b, 0) / totalRequests) : 0;
  const maxDurationMs = totalRequests ? Math.max(...durations) : 0;

  const byMethod = rows.reduce((acc, row) => {
    acc[row.method || 'UNKNOWN'] = (acc[row.method || 'UNKNOWN'] || 0) + 1;
    return acc;
  }, {});

  return { totalRequests, errorCount, clientErrorCount, avgDurationMs, maxDurationMs, byMethod };
}

function createJsonMetricRepository(store) {
  return {
    list(tenantId, limit = 100) {
      return ensureMetrics(store.read()).requestMetrics
        .filter(row => row.tenantId === tenantId)
        .slice(-limit)
        .reverse();
    },
    create(tenantId, input) {
      const data = ensureMetrics(store.read());
      const metric = {
        id: makeId('metric'),
        tenantId,
        requestId: input.requestId || '',
        method: input.method || '',
        route: input.route || '',
        statusCode: Number(input.statusCode || 0),
        durationMs: Number(input.durationMs || 0),
        actorId: input.actorId || '',
        actorType: input.actorType || '',
        createdAt: input.createdAt || now()
      };
      data.requestMetrics.push(metric);
      store.write(data);
      return metric;
    },
    summary(tenantId) {
      const rows = ensureMetrics(store.read()).requestMetrics.filter(row => row.tenantId === tenantId);
      return summarize(rows);
    }
  };
}

function createPostgresMetricRepository(store) {
  return {
    async list(tenantId, limit = 100) {
      const result = await store.query(
        `SELECT id::text, tenant_id as "tenantId", request_id as "requestId", method, route,
                status_code as "statusCode", duration_ms as "durationMs", actor_id as "actorId",
                actor_type as "actorType", created_at as "createdAt"
         FROM request_metrics
         WHERE tenant_id = $1
         ORDER BY created_at DESC
         LIMIT $2`,
        [tenantId, limit]
      );
      return result.rows;
    },
    async create(tenantId, input) {
      const result = await store.query(
        `INSERT INTO request_metrics
         (tenant_id, request_id, method, route, status_code, duration_ms, actor_id, actor_type)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         RETURNING id::text, tenant_id as "tenantId", request_id as "requestId", method, route,
                   status_code as "statusCode", duration_ms as "durationMs", actor_id as "actorId",
                   actor_type as "actorType", created_at as "createdAt"`,
        [
          tenantId,
          input.requestId || '',
          input.method || '',
          input.route || '',
          Number(input.statusCode || 0),
          Number(input.durationMs || 0),
          input.actorId || '',
          input.actorType || ''
        ]
      );
      return result.rows[0];
    },
    async summary(tenantId) {
      const result = await store.query(
        `SELECT
           count(*)::int as "totalRequests",
           count(*) FILTER (WHERE status_code >= 500)::int as "errorCount",
           count(*) FILTER (WHERE status_code >= 400 AND status_code < 500)::int as "clientErrorCount",
           COALESCE(round(avg(duration_ms)), 0)::int as "avgDurationMs",
           COALESCE(max(duration_ms), 0)::int as "maxDurationMs"
         FROM request_metrics
         WHERE tenant_id = $1`,
        [tenantId]
      );

      const methodRows = await store.query(
        `SELECT method, count(*)::int as count
         FROM request_metrics
         WHERE tenant_id = $1
         GROUP BY method`,
        [tenantId]
      );

      return {
        ...result.rows[0],
        byMethod: methodRows.rows.reduce((acc, row) => {
          acc[row.method || 'UNKNOWN'] = row.count;
          return acc;
        }, {})
      };
    }
  };
}

module.exports = { createMetricRepository, summarize };
