const { sendJson } = require('../utils/http');
const { verifyPortalToken } = require('../services/portalTokenService');

function portalAuthGuard(req, res) {
  const auth = req.headers.authorization || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : '';
  const claims = verifyPortalToken(token);

  if (!claims) {
    sendJson(res, 401, { error: { code: 'unauthorized', message: 'Missing or invalid portal token' } });
    return false;
  }

  if (claims.tenantId !== req.context.tenantId) {
    sendJson(res, 403, { error: { code: 'forbidden', message: 'Portal token tenant does not match request tenant' } });
    return false;
  }

  req.context.portalAccountId = claims.portalAccountId;
  req.context.portalCustomerId = claims.customerId;
  req.context.portalEmail = claims.email;
  return true;
}

module.exports = { portalAuthGuard };
