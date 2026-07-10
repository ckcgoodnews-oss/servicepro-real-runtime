const { logger } = require('../services/logger');

function attachRequestMetrics(req, res) {
  const startedAt = Date.now();
  const originalEnd = res.end;

  res.end = function patchedMetricsEnd(...args) {
    const durationMs = Date.now() - startedAt;
    const statusCode = res.statusCode || 200;

    try {
      const tenantId = req.context?.tenantId || process.env.DEFAULT_TENANT_ID || 'tenant_demo';
      const actorId = req.context?.portalAccountId || req.context?.userId || '';
      const actorType = req.context?.portalAccountId ? 'portal_account' : (req.context?.userId ? 'user' : 'anonymous');

      logger.info('http.request.completed', {
        requestId: req.context?.requestId || '',
        tenantId,
        method: req.method,
        route: req.url,
        statusCode,
        durationMs,
        actorType,
        actorId
      });

      if (req.context?.repositories?.metrics && req.url !== '/healthz' && req.url !== '/readyz') {
        Promise.resolve(req.context.repositories.metrics.create(tenantId, {
          requestId: req.context.requestId || '',
          method: req.method,
          route: req.url,
          statusCode,
          durationMs,
          actorId,
          actorType
        })).catch(() => {});
      }
    } catch {
      // metrics must not break the request path
    }

    return originalEnd.apply(res, args);
  };
}

module.exports = { attachRequestMetrics };
