const { sendJson } = require('../utils/http');
const { verifyAccessToken } = require('../services/tokenService');

async function authGuard(req, res) {
  const auth = req.headers.authorization || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : '';

  if (!token) {
    sendJson(res, 401, { error: { code: 'unauthorized', message: 'Missing bearer token' } });
    return false;
  }

  const claims = verifyAccessToken(token);
  if (!claims) {
    sendJson(res, 401, { error: { code: 'unauthorized', message: 'Invalid or expired bearer token' } });
    return false;
  }

  if (claims.tenantId !== req.context.tenantId) {
    sendJson(res, 403, { error: { code: 'forbidden', message: 'Token tenant does not match request tenant' } });
    return false;
  }

  req.context.userId = claims.userId;
  req.context.email = claims.email;
  req.context.roles = claims.roles || [];
  req.context.permissions = claims.permissions || [];
  return true;
}

module.exports = { authGuard };
