const { sendJson } = require('../utils/http');
const { isPlatformAdmin } = require('../services/platformAdminService');

async function dashboard(req, res) {
  if (!isPlatformAdmin(req)) {
    return sendJson(res, 403, { error: { code: 'platform_admin_required', message: 'Platform administrator access required' } });
  }

  const repos = req.context.repositories;
  const tenants = repos.workspaces?.list ? await repos.workspaces.list() : [];
  const users = repos.users?.list ? await repos.users.list(req.context.tenantId) : [];

  return sendJson(res, 200, {
    data: {
      totalTenants: tenants.length,
      totalUsers: users.length,
      activeTenants: tenants.length,
      recentSignups: [],
      systemHealth: 'operational'
    }
  });
}

module.exports = { dashboard };
