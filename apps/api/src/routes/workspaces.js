const { sendJson } = require('../utils/http');
const { isPlatformAdmin } = require('../services/platformAdminService');

function deny(res) {
  return sendJson(res, 403, { error: { code: 'platform_admin_required', message: 'Platform administrator access required' } });
}

async function list(req, res) {
  if (!isPlatformAdmin(req)) return deny(res);
  try {
    return sendJson(res, 200, { data: await req.context.repositories.workspaces.list() });
  } catch (err) {
    console.error('[workspaces.list] Error:', err?.message || err);
    return sendJson(res, 500, { error: { code: 'internal_error', message: err?.message || 'Failed to list workspaces' } });
  }
}

async function current(req, res) {
  try {
    const workspace = req.context.workspace || await req.context.repositories.workspaces.find(req.context.tenantId);
    if (!workspace) {
      // Tenant might exist as a user record but not in the tenants table yet (platform-created owners)
      // Return a minimal workspace object instead of 404
      return sendJson(res, 200, { data: { id: req.context.tenantId, tenantId: req.context.tenantId, name: req.context.tenantId } });
    }
    return sendJson(res, 200, { data: workspace });
  } catch (err) {
    console.error('[workspaces.current] Error:', err?.message || err);
    return sendJson(res, 200, { data: { id: req.context.tenantId, tenantId: req.context.tenantId, name: req.context.tenantId } });
  }
}

async function switchTenant(req, res) {
  if (!isPlatformAdmin(req)) return deny(res);
  try {
    const workspace = await req.context.repositories.workspaces.find(req.body?.tenantId);
    if (!workspace) return sendJson(res, 404, { error: { code: 'workspace_not_found', message: 'Workspace not found' } });
    return sendJson(res, 200, { data: { ...workspace, switched: true } });
  } catch (err) {
    console.error('[workspaces.switchTenant] Error:', err?.message || err);
    return sendJson(res, 500, { error: { code: 'internal_error', message: err?.message || 'Failed to switch tenant' } });
  }
}

async function deleteWorkspace(req, res, tenantId) {
  if (!isPlatformAdmin(req)) return deny(res);
  try {
    const workspace = await req.context.repositories.workspaces.find(tenantId);
    if (!workspace) return sendJson(res, 404, { error: { code: 'workspace_not_found', message: 'Workspace not found' } });
    // Delete tenant settings
    try { await req.context.repositories.store.query('DELETE FROM tenant_settings WHERE tenant_id = $1', [tenantId]); } catch {}
    // Delete users
    try { await req.context.repositories.store.query('DELETE FROM runtime_users WHERE tenant_id = $1', [tenantId]); } catch {}
    // Delete the workspace/tenant record
    try { await req.context.repositories.store.query('DELETE FROM tenants WHERE tenant_key = $1', [tenantId]); } catch {}
    return sendJson(res, 200, { data: { tenantId, deleted: true } });
  } catch (err) {
    console.error('[workspaces.delete] Error:', err?.message || err);
    return sendJson(res, 500, { error: { code: 'internal_error', message: err?.message || 'Failed to delete workspace' } });
  }
}

module.exports = { list, current, switchTenant, deleteWorkspace };
