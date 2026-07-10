const { authenticate, hasScope } = require('../services/apiKeys');

function requireApiScope(scope) {
  return (req, res, next) => {
    const header = req.get('authorization') || '';
    const rawKey = header.startsWith('Bearer ') ? header.slice(7) : '';
    const result = authenticate(rawKey);
    if (!result || !result.tenant) return res.status(401).json({ error: 'invalid_api_key' });
    if (!hasScope(result.apiKey, scope)) return res.status(403).json({ error: 'insufficient_scope', required: scope });
    req.apiKey = result.apiKey;
    req.tenant = result.tenant;
    next();
  };
}

module.exports = { requireApiScope };
