const { sendJson } = require('../utils/http');
const { isPlatformAdmin } = require('../services/platformAdminService');

function deny(res) {
  return sendJson(res, 403, { error: { code: 'platform_admin_required', message: 'Platform administrator access required' } });
}

async function list(req, res) {
  if (!isPlatformAdmin(req)) return deny(res);
  return sendJson(res, 200, { data: await req.context.repositories.workspaces.list() });
}

async function current(req, res) {
  const workspace = req.context.workspace || await req.context.repositories.workspaces.find(req.context.tenantId);
  if (!workspace) return sendJson(res, 404, { error: { code: 'workspace_not_found', message: 'Workspace not found' } });
  return sendJson(res, 200, { data: workspace });
}

async function switchTenant(req, res) {
  if (!isPlatformAdmin(req)) return deny(res);
  const workspace = await req.context.repositories.workspaces.find(req.body?.tenantId);
  if (!workspace) return sendJson(res, 404, { error: { code: 'workspace_not_found', message: 'Workspace not found' } });
  return sendJson(res, 200, { data: { ...workspace, switched: true } });
}

module.exports = { list, current, switchTenant };
