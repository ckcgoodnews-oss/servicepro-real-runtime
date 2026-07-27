const { sendJson } = require('../utils/http');
const { isPlatformAdmin } = require('../services/platformAdminService');

async function dashboard(req, res) {
  if (!isPlatformAdmin(req)) {
    return sendJson(res, 403, { error: { code: 'platform_admin_required', message: 'Platform administrator access required' } });
  }

  const repos = req.context.repositories;

  // Get full tenant management data (includes per-tenant user counts, statuses, storage, etc.)
  const tenantList = repos.tenantManagement?.list
    ? await repos.tenantManagement.list(repos)
    : [];

  // Build per-tenant breakdown in the shape the frontend expects
  let totalUsers = 0;
  let activeUsers = 0;
  let owners = 0;
  let healthySubscriptions = 0;
  let storageBytes = 0;
  let meteredTenants = 0;

  const tenants = tenantList.map(tenant => {
    const usage = tenant.usage || {};
    const tenantUsers = usage.users || 0;
    const tenantOwners = usage.owners || 0;
    const tenantStorage = Number(tenant.storageBytes || 0) + Number(usage.mediaBytes || 0);
    const status = (tenant.status || 'active').toLowerCase();
    const isHealthy = status === 'active' || status === 'trial';

    totalUsers += tenantUsers;
    activeUsers += tenantUsers;
    owners += tenantOwners;
    if (isHealthy) healthySubscriptions++;
    storageBytes += tenantStorage;
    if (tenantStorage > 0) meteredTenants++;

    return {
      tenantId: tenant.tenantId || tenant.id,
      tenantName: tenant.name || tenant.tenantId || tenant.id,
      tenantStatus: status,
      totalUsers: tenantUsers,
      activeUsers: tenantUsers,
      ownerCount: tenantOwners,
      subscriptionStatus: status,
      subscriptionPlan: tenant.plan || 'manual',
      storageBytes: tenantStorage,
      storageMetered: tenantStorage > 0
    };
  });

  return sendJson(res, 200, {
    data: {
      summary: {
        totalTenants: tenantList.length,
        activeUsers,
        owners,
        healthySubscriptions,
        storageBytes,
        meteredTenants
      },
      tenants,
      generatedAt: new Date().toISOString()
    }
  });
}

module.exports = { dashboard };
