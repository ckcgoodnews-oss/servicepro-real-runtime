function csv(value) {
  return String(value || '')
    .split(',')
    .map(x => x.trim())
    .filter(Boolean);
}

function securityConfig() {
  return {
    corsAllowedOrigins: csv(process.env.CORS_ALLOWED_ORIGINS || 'http://localhost:3000,http://localhost:5173'),
    maxJsonBodyBytes: Number(process.env.MAX_JSON_BODY_BYTES || 1024 * 1024),
    rateLimitWindowMs: Number(process.env.RATE_LIMIT_WINDOW_MS || 60000),
    rateLimitMaxRequests: Number(process.env.RATE_LIMIT_MAX_REQUESTS || 120),
    authRateLimitMaxRequests: Number(process.env.AUTH_RATE_LIMIT_MAX_REQUESTS || 12)
  };
}

module.exports = { securityConfig, csv };
