const { sendJson } = require('../utils/http');
const { verifyAccessToken, hashToken } = require('../services/tokenService');
const { permissionsForRoles } = require('../auth/permissions');
const { platformAdminEmails } = require('../services/platformAdminService');

async function authGuard(req, res) {
  const auth = req.headers.authorization || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : '';

  if (!token) {
    sendJson(res, 401, { error: { code: 'unauthorized', message: 'Missing bearer token' } });
    return false;
  }

  let claims = verifyAccessToken(token);
  if (!claims) {
    const apiIdentity = await req.context.repositories.users.findByApiToken(req.context.tenantId, hashToken(token));
    if (!apiIdentity) {
      sendJson(res, 401, { error: { code: 'unauthorized', message: 'Invalid or expired bearer token' } });
      return false;
    }
    const user = apiIdentity.user; const roles = user.roles || [];
    claims = { userId:user.id,tenantId:user.tenantId,email:user.email,roles,permissions:Array.from(new Set([...permissionsForRoles(roles),...(user.permissions || [])])),apiTokenId:apiIdentity.tokenId };
  }

  const tokenTenantId = claims.tenantId;
  if (tokenTenantId !== req.context.tenantId) {
    const platformAdmin = platformAdminEmails().includes(String(claims.email || '').trim().toLowerCase());
    if (!platformAdmin) {
      sendJson(res, 403, { error: { code: 'forbidden', message: 'Token tenant does not match request tenant' } });
      return false;
    }
    const workspace = await req.context.repositories.workspaces.find(req.context.tenantId);
    if (!workspace) {
      sendJson(res, 404, { error: { code: 'workspace_not_found', message: 'Requested workspace does not exist' } });
      return false;
    }
    req.context.tenantId = workspace.tenantId;
    req.context.workspace = workspace;
  }

  if (claims.sessionId && !(await req.context.repositories.authSessions.isActive(claims.sessionId, tokenTenantId, claims.userId))) {
    sendJson(res, 401, { error: { code: 'session_revoked', message: 'Session is expired or revoked' } });
    return false;
  }

  req.context.userId = claims.userId;
  req.context.email = claims.email;
  req.context.roles = claims.roles || [];
  req.context.permissions = claims.permissions || [];
  req.context.sessionId = claims.sessionId || '';
  req.context.apiTokenId = claims.apiTokenId || '';
  req.context.authTenantId = tokenTenantId;
  return true;
}

module.exports = { authGuard };
