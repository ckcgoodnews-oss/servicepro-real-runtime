const store = require('../db');

async function domainTenant(req, res, next) {
  const host = (req.hostname || '').toLowerCase();
  res.locals.resolvedTenant = null;
  if (!host || host === 'localhost' || host === '127.0.0.1') return next();
  const tenant = await store.findOne('tenants', t => t.active !== false && [t.domain, t.custom_domain].filter(Boolean).map(String).map(x=>x.toLowerCase()).includes(host));
  if (tenant) res.locals.resolvedTenant = tenant;
  next();
}

module.exports = { domainTenant };
