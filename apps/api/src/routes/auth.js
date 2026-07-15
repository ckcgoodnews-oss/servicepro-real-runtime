const crypto = require('crypto');
const { sendJson } = require('../utils/http');
const { verifyPassword } = require('../services/passwordService');
const { issueAccessToken, issueOpaqueToken, hashToken } = require('../services/tokenService');
const { permissionsForRoles } = require('../auth/permissions');

const ACCESS_TTL_SECONDS = () => Number(process.env.ACCESS_TOKEN_TTL_SECONDS || 900);
const REFRESH_TTL_SECONDS = () => Number(process.env.REFRESH_TOKEN_TTL_SECONDS || 60 * 60 * 24 * 30);

function passwordErrors(password) {
  const value = String(password || ''); const errors = [];
  if (value.length < 12) errors.push('at least 12 characters');
  if (!/[A-Z]/.test(value)) errors.push('an uppercase letter');
  if (!/[a-z]/.test(value)) errors.push('a lowercase letter');
  if (!/[0-9]/.test(value)) errors.push('a number');
  if (!/[^A-Za-z0-9]/.test(value)) errors.push('a symbol');
  return errors;
}

function publicUser(user) {
  const roles = user.roles || []; const explicit = user.permissions || [];
  return { id: user.id, tenantId: user.tenantId, email: user.email, name: user.name, roles, permissions: Array.from(new Set([...permissionsForRoles(roles), ...explicit])) };
}

async function issueSession(req, user, existingSessionId, currentRefreshHash) {
  const refreshToken = issueOpaqueToken(); const expiresAt = new Date(Date.now() + REFRESH_TTL_SECONDS() * 1000).toISOString();
  let session;
  if (existingSessionId) {
    session = await req.context.repositories.authSessions.rotate(existingSessionId, currentRefreshHash, hashToken(refreshToken), expiresAt);
    if (!session) throw new Error('Session is no longer active');
    session.id = session.id || existingSessionId;
  } else {
    session = await req.context.repositories.authSessions.createSession({ tenantId: user.tenantId, userId: user.id, refreshTokenHash: hashToken(refreshToken), expiresAt, ipAddress: req.socket?.remoteAddress || '', userAgent: req.headers['user-agent'] || '' });
  }
  const safeUser = publicUser(user);
  const accessToken = issueAccessToken({ userId: user.id, tenantId: user.tenantId, email: user.email, roles: safeUser.roles, permissions: safeUser.permissions, sessionId: session.id });
  return { accessToken, refreshToken, tokenType: 'Bearer', expiresIn: ACCESS_TTL_SECONDS(), user: safeUser };
}

async function login(req, res) {
  const { email, password } = req.body || {};
  if (!email || !password) return sendJson(res, 400, { error: { code: 'validation_failed', message: 'email and password are required' } });
  const user = await req.context.repositories.users.findByEmail(req.context.tenantId, email);
  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    await req.context.repositories.authEvents.log({ tenantId: req.context.tenantId, userId: null, eventType: 'auth.login_failed', email, status: 'failed' });
    return sendJson(res, 401, { error: { code: 'unauthorized', message: 'Invalid email or password' } });
  }
  if (user.mfaEnabled) {
    const code = String(crypto.randomInt(100000, 1000000));
    const challenge = await req.context.repositories.authSessions.createMfaChallenge({ tenantId: user.tenantId, userId: user.id, tokenHash: hashToken(code), expiresAt: new Date(Date.now() + 5 * 60 * 1000).toISOString() });
    await req.context.repositories.authEvents.log({ tenantId: user.tenantId, userId: user.id, eventType: 'auth.mfa_challenge', email: user.email, status: 'pending' });
    const data = { mfaRequired: true, challengeId: challenge.id, delivery: 'email', expiresIn: 300 };
    if (process.env.NODE_ENV !== 'production' && process.env.EXPOSE_AUTH_TOKENS === 'true') data.developmentCode = code;
    return sendJson(res, 202, { data });
  }
  const data = await issueSession(req, user);
  await req.context.repositories.authEvents.log({ tenantId: user.tenantId, userId: user.id, eventType: 'auth.login_success', email: user.email, status: 'success' });
  return sendJson(res, 200, { data });
}

async function refresh(req, res) {
  const { refreshToken } = req.body || {};
  if (!refreshToken) return sendJson(res, 400, { error: { code: 'validation_failed', message: 'refreshToken is required' } });
  const currentRefreshHash = hashToken(refreshToken);
  const session = await req.context.repositories.authSessions.findActiveByRefreshHash(req.context.tenantId, currentRefreshHash);
  if (!session) return sendJson(res, 401, { error: { code: 'invalid_refresh_token', message: 'Refresh token is invalid or expired' } });
  const user = await req.context.repositories.users.findById(req.context.tenantId, session.userId);
  if (!user) return sendJson(res, 401, { error: { code: 'invalid_refresh_token', message: 'Refresh token is invalid or expired' } });
  try { return sendJson(res, 200, { data: await issueSession(req, user, session.id, currentRefreshHash) }); }
  catch { return sendJson(res, 401, { error: { code: 'refresh_token_reused', message: 'Refresh token has already been rotated' } }); }
}

async function logout(req, res) {
  if (req.context.sessionId) await req.context.repositories.authSessions.revoke(req.context.sessionId);
  await req.context.repositories.authEvents.log({ tenantId: req.context.tenantId, userId: req.context.userId, eventType: 'auth.logout', email: req.context.email, status: 'success' });
  return sendJson(res, 204, {});
}

async function register(req, res) {
  if (process.env.ALLOW_PUBLIC_REGISTRATION !== 'true') return sendJson(res, 403, { error: { code: 'registration_disabled', message: 'Public registration is disabled' } });
  const { email, name, password } = req.body || {}; const errors = passwordErrors(password);
  if (!email || !name || errors.length) return sendJson(res, 400, { error: { code: 'validation_failed', message: errors.length ? `Password must include ${errors.join(', ')}` : 'email, name, and password are required' } });
  const user = await req.context.repositories.users.create({ tenantId: req.context.tenantId, email, name, password, roles: ['technician'] });
  if (!user) return sendJson(res, 409, { error: { code: 'account_exists', message: 'An account already exists for that email' } });
  return sendJson(res, 201, { data: await issueSession(req, user) });
}

async function requestPasswordReset(req, res) {
  const { email } = req.body || {};
  if (email) {
    const user = await req.context.repositories.users.findByEmail(req.context.tenantId, email);
    if (user) {
      const token = issueOpaqueToken();
      await req.context.repositories.authSessions.createPasswordReset({ tenantId: user.tenantId, userId: user.id, tokenHash: hashToken(token), expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString() });
      await req.context.repositories.authEvents.log({ tenantId: user.tenantId, userId: user.id, eventType: 'auth.password_reset_requested', email: user.email, status: 'success' });
      if (process.env.NODE_ENV !== 'production' && process.env.EXPOSE_AUTH_TOKENS === 'true') return sendJson(res, 202, { data: { accepted: true, developmentToken: token } });
    }
  }
  return sendJson(res, 202, { data: { accepted: true } });
}

async function confirmPasswordReset(req, res) {
  const { token, password } = req.body || {}; const errors = passwordErrors(password);
  if (!token || errors.length) return sendJson(res, 400, { error: { code: 'validation_failed', message: errors.length ? `Password must include ${errors.join(', ')}` : 'token is required' } });
  const record = await req.context.repositories.authSessions.consumePasswordReset(req.context.tenantId, hashToken(token));
  if (!record) return sendJson(res, 400, { error: { code: 'invalid_reset_token', message: 'Reset link is invalid or expired' } });
  await req.context.repositories.users.updatePassword(req.context.tenantId, record.userId, password);
  await req.context.repositories.authSessions.revokeForUser(req.context.tenantId, record.userId);
  await req.context.repositories.authEvents.log({ tenantId: req.context.tenantId, userId: record.userId, eventType: 'auth.password_reset_completed', status: 'success' });
  return sendJson(res, 200, { data: { reset: true } });
}

async function acceptInvitation(req, res) {
  const { token, name, password } = req.body || {}; const errors = passwordErrors(password);
  if (!token || errors.length) return sendJson(res, 400, { error: { code: 'validation_failed', message: errors.length ? `Password must include ${errors.join(', ')}` : 'token is required' } });
  const invitation = await req.context.repositories.authSessions.consumeInvitation(req.context.tenantId, hashToken(token));
  if (!invitation) return sendJson(res, 400, { error: { code: 'invalid_invitation', message: 'Invitation is invalid or expired' } });
  let user = await req.context.repositories.users.findById(req.context.tenantId, invitation.userId);
  if (user) user = await req.context.repositories.users.updatePassword(req.context.tenantId, user.id, password);
  else user = await req.context.repositories.users.create({ tenantId: req.context.tenantId, email: invitation.email, name: name || invitation.name, password, roles: ['technician'] });
  return sendJson(res, 200, { data: { accepted: true, user: publicUser(user) } });
}

async function verifyMfa(req, res) {
  const { challengeId, code } = req.body || {};
  if (!challengeId || !code) return sendJson(res, 400, { error: { code: 'validation_failed', message: 'challengeId and code are required' } });
  const challenge = await req.context.repositories.authSessions.consumeMfaChallenge(req.context.tenantId, challengeId, hashToken(code));
  if (!challenge) return sendJson(res, 401, { error: { code: 'invalid_mfa_code', message: 'Verification code is invalid or expired' } });
  const user = await req.context.repositories.users.findById(req.context.tenantId, challenge.userId);
  if (!user) return sendJson(res, 401, { error: { code: 'unauthorized', message: 'Account is unavailable' } });
  return sendJson(res, 200, { data: await issueSession(req, user) });
}

function me(req, res) { return sendJson(res, 200, { data: { userId: req.context.userId, tenantId: req.context.tenantId, email: req.context.email, roles: req.context.roles || [], permissions: req.context.permissions || [], sessionId: req.context.sessionId || '' } }); }
function authz(req, res) { return sendJson(res, 200, { data: { tenantId: req.context.tenantId, userId: req.context.userId, roles: req.context.roles || [], permissions: req.context.permissions || [] } }); }

module.exports = { login, refresh, logout, register, requestPasswordReset, confirmPasswordReset, acceptInvitation, verifyMfa, me, authz, passwordErrors };
