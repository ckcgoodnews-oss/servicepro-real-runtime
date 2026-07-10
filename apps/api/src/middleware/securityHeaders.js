function applySecurityHeaders(req, res) {
  res.setHeader('x-content-type-options', 'nosniff');
  res.setHeader('x-frame-options', 'DENY');
  res.setHeader('referrer-policy', 'no-referrer');
  res.setHeader('permissions-policy', 'camera=(), microphone=(), geolocation=()');
  res.setHeader('cross-origin-resource-policy', 'same-site');

  if ((process.env.NODE_ENV || 'development') === 'production') {
    res.setHeader('strict-transport-security', 'max-age=31536000; includeSubDomains');
  }
}

module.exports = { applySecurityHeaders };
