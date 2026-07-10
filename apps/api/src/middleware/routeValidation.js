const { sendJson } = require('../utils/http');
const { validateRoute } = require('../services/validationSchemaService');
const { toErrorPayload } = require('../errors/domainError');

function applyRouteValidation(req, res) {
  try {
    validateRoute(req.method, req.url, req.body || {});
    return false;
  } catch (err) {
    sendJson(res, err.status || 400, toErrorPayload(err));
    return true;
  }
}

module.exports = { applyRouteValidation };
