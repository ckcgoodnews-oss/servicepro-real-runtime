const crypto = require('crypto');

function base64url(input) {
  return Buffer.from(input).toString('base64url');
}

function sign(payload) {
  const secret = process.env.JWT_SECRET || 'dev-secret-change-me';
  return crypto.createHmac('sha256', secret).update(payload).digest('base64url');
}

function issueAccessToken({ userId, tenantId, email, roles = [], permissions = [] }) {
  const ttl = Number(process.env.ACCESS_TOKEN_TTL_SECONDS || 3600);
  const header = { alg: 'HS256', typ: 'JWT' };
  const now = Math.floor(Date.now() / 1000);
  const claims = {
    userId,
    tenantId,
    email,
    roles,
    permissions,
    iat: now,
    exp: now + ttl
  };

  const encodedHeader = base64url(JSON.stringify(header));
  const encodedClaims = base64url(JSON.stringify(claims));
  const signature = sign(`${encodedHeader}.${encodedClaims}`);
  return `${encodedHeader}.${encodedClaims}.${signature}`;
}

function verifyAccessToken(token) {
  const parts = String(token || '').split('.');
  if (parts.length !== 3) return null;

  const [encodedHeader, encodedClaims, signature] = parts;
  const expected = sign(`${encodedHeader}.${encodedClaims}`);
  if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) return null;

  try {
    const claims = JSON.parse(Buffer.from(encodedClaims, 'base64url').toString('utf8'));
    if (claims.exp && claims.exp < Math.floor(Date.now() / 1000)) return null;
    return claims;
  } catch {
    return null;
  }
}

module.exports = { issueAccessToken, verifyAccessToken };
