function isUuid(value) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    String(value || '')
  );
}

async function resolveOperationalTenantId(store, tenantIdentifier) {
  const value = String(tenantIdentifier || '').trim();

  if (!value) {
    throw new Error('Tenant identifier is required.');
  }

  if (isUuid(value)) {
    return value;
  }

  /*
   * JSON mode continues using the symbolic tenant key because JSON
   * repositories use values such as "tenant_demo".
   */
  if (!store || store.type !== 'postgres') {
    return value;
  }

  const result = await store.query(
    `
      SELECT id::text AS id
      FROM tenants
      WHERE tenant_key = $1
      LIMIT 1
    `,
    [value]
  );

  if (!result.rows[0]) {
    throw new Error(
      `No operational tenant UUID exists for tenant key "${value}".`
    );
  }

  return result.rows[0].id;
}

async function attachOperationalTenant(req) {
  const context = req.context || (req.context = {});
  const tenantKey = context.tenantKey || context.tenantId;

  context.tenantKey = tenantKey;
  context.operationalTenantId = await resolveOperationalTenantId(
    context.repositories && context.repositories.store,
    tenantKey
  );

  return context.operationalTenantId;
}

function operationalTenant(req) {
  return req.context.operationalTenantId || req.context.tenantId;
}

module.exports = {
  isUuid,
  resolveOperationalTenantId,
  attachOperationalTenant,
  operationalTenant
};
