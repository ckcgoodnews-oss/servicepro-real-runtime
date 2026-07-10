const { requestAuditEvent } = require('../services/auditService');

function attachAuditCompletion(req, res) {
  const startedAt = Date.now();
  const originalEnd = res.end;

  res.end = function patchedEnd(...args) {
    const durationMs = Date.now() - startedAt;
    const statusCode = res.statusCode || 200;

    try {
      if (req.context && req.context.repositories && req.context.repositories.audit && req.url !== '/healthz' && req.url !== '/readyz') {
        const event = requestAuditEvent(req, statusCode, durationMs);
        Promise.resolve(req.context.repositories.audit.create(req.context.tenantId || 'tenant_demo', event)).catch(() => {});
      }
    } catch {
      // audit logging must never break the request path
    }

    return originalEnd.apply(res, args);
  };
}

module.exports = { attachAuditCompletion };
