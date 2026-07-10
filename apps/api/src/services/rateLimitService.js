const buckets = new Map();

function keyFor(req) {
  const forwarded = req.headers['x-forwarded-for'];
  const ip = String(forwarded || req.socket?.remoteAddress || 'local').split(',')[0].trim();
  const tenantId = req.context?.tenantId || 'public';
  const routeGroup = req.url.startsWith('/auth/') || req.url.startsWith('/portal/login') ? 'auth' : 'general';
  return `${tenantId}:${routeGroup}:${ip}`;
}

function checkRateLimit(req, config) {
  const key = keyFor(req);
  const now = Date.now();
  const isAuth = key.includes(':auth:');
  const limit = isAuth ? config.authRateLimitMaxRequests : config.rateLimitMaxRequests;
  const windowMs = config.rateLimitWindowMs;

  const current = buckets.get(key) || { count: 0, resetAt: now + windowMs };
  if (current.resetAt <= now) {
    current.count = 0;
    current.resetAt = now + windowMs;
  }

  current.count += 1;
  buckets.set(key, current);

  return {
    allowed: current.count <= limit,
    key,
    limit,
    remaining: Math.max(limit - current.count, 0),
    resetAt: current.resetAt
  };
}

function snapshot() {
  return Array.from(buckets.entries()).map(([key, value]) => ({ key, ...value }));
}

function resetRateLimits() {
  buckets.clear();
}

module.exports = { checkRateLimit, snapshot, resetRateLimits, keyFor };
