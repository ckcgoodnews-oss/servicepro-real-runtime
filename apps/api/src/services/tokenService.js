const crypto = require('crypto');

function base64url(input) {
  return Buffer.from(input).toString('base64url');
}

function sign(payload) {
  const secret = process.env.JWT_SECRET || 'dev-secret-change-me';
  return crypto.createHmac('sha256', secret).update(payload).digest('base64url');
}

function issueAccessToken({ userId, tenantId, email, roles = [], permissions = [], sessionId }) {
  const ttl = Number(process.env.ACCESS_TOKEN_TTL_SECONDS || 900);
  const header = { alg: 'HS256', typ: 'JWT' };
  const now = Math.floor(Date.now() / 1000);
  const claims = {
    userId,
    tenantId,
    email,
    roles,
    permissions,
    sessionId,
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
  const actualBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expected);
  if (actualBuffer.length !== expectedBuffer.length || !crypto.timingSafeEqual(actualBuffer, expectedBuffer)) return null;

  try {
    const claims = JSON.parse(Buffer.from(encodedClaims, 'base64url').toString('utf8'));
    if (claims.exp && claims.exp < Math.floor(Date.now() / 1000)) return null;
    return claims;
  } catch {
    return null;
  }
}

function issueOpaqueToken(bytes = 32) { return crypto.randomBytes(bytes).toString('base64url'); }
function hashToken(token) { return crypto.createHash('sha256').update(String(token || '')).digest('hex'); }

module.exports = { issueAccessToken, verifyAccessToken, issueOpaqueToken, hashToken };
