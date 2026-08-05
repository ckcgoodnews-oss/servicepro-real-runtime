const { getRepositoriesForTenant } = require('../repositories/repositoryFactory');

function attachRequestContext(req) {
  if (!req.context) req.context = {};

  if (!req.context.tenantId) {
    req.context.tenantId = req.headers['x-tenant-id'] || process.env.DEFAULT_TENANT_ID || 'tenant_demo';
  }

  // Build a fresh repository set backed by a tenant-scoped store so every
  // Postgres query on this request automatically runs with:
  //   SET LOCAL app.current_tenant = '<tenantId>'
  // This satisfies RLS policies without changing any repository code.
  req.context.repositories = getRepositoriesForTenant(req.context.tenantId);

  // Also expose the scoped store directly for any ad-hoc queries in routes.
  req.context.tenantStore = req.context.repositories.store;

  return req.context;
}

module.exports = { attachRequestContext };
