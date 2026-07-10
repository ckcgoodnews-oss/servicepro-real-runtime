const crypto = require('crypto');

function sign(payload) {
  const secret = process.env.PORTAL_TOKEN_SECRET || process.env.JWT_SECRET || 'dev-portal-secret-change-me';
  return crypto.createHmac('sha256', secret).update(payload).digest('base64url');
}

function encode(obj) {
  return Buffer.from(JSON.stringify(obj)).toString('base64url');
}

function issuePortalToken({ portalAccountId, customerId, tenantId, email }) {
  const now = Math.floor(Date.now() / 1000);
  const ttl = Number(process.env.PORTAL_TOKEN_TTL_SECONDS || 3600);
  const claims = { portalAccountId, customerId, tenantId, email, iat: now, exp: now + ttl, typ: 'portal' };
  const body = encode(claims);
  const signature = sign(body);
  return `${body}.${signature}`;
}

function verifyPortalToken(token) {
  const parts = String(token || '').split('.');
  if (parts.length !== 2) return null;
  const [body, signature] = parts;
  if (sign(body) !== signature) return null;

  try {
    const claims = JSON.parse(Buffer.from(body, 'base64url').toString('utf8'));
    if (claims.exp && claims.exp < Math.floor(Date.now() / 1000)) return null;
    if (claims.typ !== 'portal') return null;
    return claims;
  } catch {
    return null;
  }
}

module.exports = { issuePortalToken, verifyPortalToken };
