const { read } = require('../db/store');

function attachTenant(req, res, next) {
  const db = read();
  let tenant = req.session.tenantId ? db.tenants.find(t => t.id === req.session.tenantId) : null;
  if (!tenant) tenant = db.tenants[0] || null;
  req.tenant = tenant;
  if (tenant) req.session.tenantId = tenant.id;
  next();
}

module.exports = { attachTenant };
