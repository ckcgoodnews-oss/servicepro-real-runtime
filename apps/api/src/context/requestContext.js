const { getRepositories } = require('../repositories/repositoryFactory');

function attachRequestContext(req) {
  if (!req.context) req.context = {};

  if (!req.context.tenantId) {
    req.context.tenantId = req.headers['x-tenant-id'] || process.env.DEFAULT_TENANT_ID || 'tenant_demo';
  }

  req.context.repositories = getRepositories();
  return req.context;
}

module.exports = { attachRequestContext };
