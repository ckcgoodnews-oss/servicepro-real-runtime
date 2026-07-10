const { securityConfig } = require('../services/securityConfig');

function applyCors(req, res) {
  const config = securityConfig();
  const origin = req.headers.origin || '';

  if (origin && config.corsAllowedOrigins.includes(origin)) {
    res.setHeader('access-control-allow-origin', origin);
    res.setHeader('vary', 'Origin');
  }

  res.setHeader('access-control-allow-methods', 'GET,POST,PATCH,PUT,DELETE,OPTIONS');
  res.setHeader('access-control-allow-headers', 'authorization,content-type,x-tenant-id,x-request-id');
  res.setHeader('access-control-expose-headers', 'x-request-id');
  res.setHeader('access-control-max-age', '600');

  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    res.end();
    return true;
  }

  return false;
}

module.exports = { applyCors };
