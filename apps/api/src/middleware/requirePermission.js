const { sendJson } = require('../utils/http');
const { hasPermission } = require('../auth/permissions');

function requirePermission(permission) {
  return function permissionMiddleware(req, res) {
    if (!hasPermission(req.context, permission)) {
      sendJson(res, 403, {
        error: {
          code: 'forbidden',
          message: `Missing required permission: ${permission}`
        }
      });
      return false;
    }

    return true;
  };
}

module.exports = { requirePermission };
