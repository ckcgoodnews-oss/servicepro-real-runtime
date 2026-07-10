function tenantMiddleware(req) {
  const tenantId = req.headers['x-tenant-id'] || process.env.DEFAULT_TENANT_ID || 'tenant_demo';
  req.context.tenantId = tenantId;
}

module.exports = { tenantMiddleware };
