const { securityConfig } = require('../services/securityConfig');
const { checkRateLimit } = require('../services/rateLimitService');
const { sendJson } = require('../utils/http');

function applyRateLimit(req, res) {
  const result = checkRateLimit(req, securityConfig());

  res.setHeader('x-rate-limit-limit', String(result.limit));
  res.setHeader('x-rate-limit-remaining', String(result.remaining));
  res.setHeader('x-rate-limit-reset', String(Math.ceil(result.resetAt / 1000)));

  if (!result.allowed) {
    sendJson(res, 429, {
      error: {
        code: 'rate_limited',
        message: 'Too many requests. Try again later.'
      }
    });
    return true;
  }

  return false;
}

module.exports = { applyRateLimit };
