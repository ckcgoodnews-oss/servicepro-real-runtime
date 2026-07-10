const { v4: uuid } = require('uuid');
const store = require('../db');
async function audit(req, action, entity, entityId, metadata = {}) {
  await store.insert('audit_logs', { id: uuid(), tenant_id: req.tenant?.id || req.user?.tenant_id || null, user_id: req.user?.id || null, action, entity, entity_id: entityId || null, metadata, created_at: new Date().toISOString() });
}
module.exports = { audit };
