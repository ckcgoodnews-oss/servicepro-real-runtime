function nowIso() {
  return new Date().toISOString();
}

function safeJson(value) {
  try {
    return JSON.parse(JSON.stringify(value || {}));
  } catch {
    return {};
  }
}

function requestAuditEvent(req, statusCode, durationMs) {
  return {
    eventType: 'http.request',
    actorType: req.context.portalAccountId ? 'portal_account' : (req.context.userId ? 'user' : 'anonymous'),
    actorId: req.context.portalAccountId || req.context.userId || '',
    entityType: 'http',
    entityId: '',
    action: `${req.method} ${req.url}`,
    route: req.url,
    method: req.method,
    statusCode,
    durationMs,
    metadata: {
      userAgent: req.headers['user-agent'] || '',
      tenantId: req.context.tenantId || ''
    }
  };
}

function entityAuditEvent({ actorId = '', actorType = 'system', entityType, entityId = '', action, metadata = {} }) {
  return {
    eventType: 'entity.activity',
    actorType,
    actorId,
    entityType,
    entityId,
    action,
    route: '',
    method: '',
    statusCode: 0,
    durationMs: 0,
    metadata: safeJson(metadata),
    createdAt: nowIso()
  };
}

module.exports = { nowIso, safeJson, requestAuditEvent, entityAuditEvent };
