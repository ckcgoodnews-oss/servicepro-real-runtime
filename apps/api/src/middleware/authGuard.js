const { sendJson } = require('../utils/http');
const { verifyAccessToken, hashToken } = require('../services/tokenService');
const { permissionsForRoles } = require('../auth/permissions');

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

  if (claims.tenantId !== req.context.tenantId) {
    sendJson(res, 403, { error: { code: 'forbidden', message: 'Token tenant does not match request tenant' } });
    return false;
  }

  if (claims.sessionId && !(await req.context.repositories.authSessions.isActive(claims.sessionId, claims.tenantId, claims.userId))) {
    sendJson(res, 401, { error: { code: 'session_revoked', message: 'Session is expired or revoked' } });
    return false;
  }

  req.context.userId = claims.userId;
  req.context.email = claims.email;
  req.context.roles = claims.roles || [];
  req.context.permissions = claims.permissions || [];
  req.context.sessionId = claims.sessionId || '';
  req.context.apiTokenId = claims.apiTokenId || '';
  return true;
}

module.exports = { authGuard };
