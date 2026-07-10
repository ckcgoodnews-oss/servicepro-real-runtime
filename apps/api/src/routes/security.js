const { sendJson } = require('../utils/http');
const { snapshot } = require('../services/rateLimitService');

function tenant(req) {
  return req.context.tenantId;
}

function events(req, res) {
  Promise.resolve(req.context.repositories.securityEvents.list(tenant(req), 100))
    .then(data => sendJson(res, 200, { data }));
}

function rateLimits(req, res) {
  return sendJson(res, 200, { data: snapshot() });
}

module.exports = { events, rateLimits };
