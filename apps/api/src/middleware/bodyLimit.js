const { securityConfig } = require('../services/securityConfig');
const { sendJson } = require('../utils/http');

function rejectIfPayloadTooLarge(req, res) {
  const max = securityConfig().maxJsonBodyBytes;
  const declared = Number(req.headers['content-length'] || 0);

  if (declared > max) {
    sendJson(res, 413, {
      error: {
        code: 'payload_too_large',
        message: `Request body exceeds ${max} bytes`
      }
    });
    return true;
  }

  return false;
}

module.exports = { rejectIfPayloadTooLarge };
