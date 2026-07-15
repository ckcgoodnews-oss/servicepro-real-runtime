const assert = require('assert');
const { createUserRepository } = require('../apps/api/src/repositories/userRepository');
const { createAuthSessionRepository } = require('../apps/api/src/repositories/authSessionRepository');
const { issueAccessToken, verifyAccessToken, hashToken } = require('../apps/api/src/services/tokenService');
const auth = require('../apps/api/src/routes/auth');

function memoryStore() {
  let data = { users: [], authSessions: [], passwordResetTokens: [], invitations: [], mfaChallenges: [] };
  return { type: 'json', read: () => structuredClone(data), write: value => { data = structuredClone(value); } };
}

function response() {
  return { statusCode: 0, headers: {}, setHeader(key,value) { this.headers[key] = value; }, end(raw) { this.body = raw ? JSON.parse(raw) : {}; } };
}

(async () => {
  assert.deepStrictEqual(auth.passwordErrors('StrongPassword1!'), []);
  assert.ok(auth.passwordErrors('weak').length >= 4);
  assert.doesNotThrow(() => verifyAccessToken('a.b.c'));
  const token = issueAccessToken({ userId:'u1',tenantId:'tenant_demo',email:'a@example.com',sessionId:'s1' });
  assert.equal(verifyAccessToken(token).sessionId, 's1');

  const store = memoryStore(); const users = createUserRepository(store); const sessions = createAuthSessionRepository(store);
  const user = await users.create({ tenantId:'tenant_demo',email:'owner@example.com',name:'Owner',password:'StrongPassword1!',roles:['owner'] });
  const repositories = { users, authSessions:sessions, authEvents:{ log: async event => event } };
  const req = body => ({ body, headers:{'user-agent':'test'}, socket:{remoteAddress:'127.0.0.1'}, context:{tenantId:'tenant_demo',repositories} });

  let res = response(); await auth.login(req({email:user.email,password:'StrongPassword1!'}),res);
  assert.equal(res.statusCode,200); assert.ok(res.body.data.accessToken); assert.ok(res.body.data.refreshToken);
  const firstRefresh = res.body.data.refreshToken;
  res = response(); await auth.refresh(req({refreshToken:firstRefresh}),res);
  assert.equal(res.statusCode,200); assert.notEqual(res.body.data.refreshToken,firstRefresh);
  const activeSessionId = verifyAccessToken(res.body.data.accessToken).sessionId;
  assert.equal(await sessions.findActiveByRefreshHash('tenant_demo',hashToken(firstRefresh)),null,'rotated token must be invalid');

  process.env.EXPOSE_AUTH_TOKENS='true'; process.env.NODE_ENV='test';
  res=response(); await auth.requestPasswordReset(req({email:user.email}),res); const resetToken=res.body.data.developmentToken; assert.ok(resetToken);
  res=response(); await auth.confirmPasswordReset(req({token:resetToken,password:'AnotherStrong2!'}),res); assert.equal(res.statusCode,200);
  assert.equal(await sessions.isActive(activeSessionId,'tenant_demo',user.id),false,'password reset must revoke active sessions');
  res=response(); await auth.confirmPasswordReset(req({token:resetToken,password:'AnotherStrong3!'}),res); assert.equal(res.statusCode,400,'reset token must be one-time');

  const inviteToken='invite-token';
  await sessions.createInvitation({tenantId:'tenant_demo',userId:user.id,email:user.email,name:user.name,tokenHash:hashToken(inviteToken),expiresAt:new Date(Date.now()+60000).toISOString()});
  assert.ok(await sessions.consumeInvitation('tenant_demo',hashToken(inviteToken)));
  assert.equal(await sessions.consumeInvitation('tenant_demo',hashToken(inviteToken)),null,'invitation must be one-time');

  const routes = require('fs').readFileSync(require('path').join(__dirname,'../apps/api/src/router.js'),'utf8');
  for (const path of ['/auth/register','/auth/refresh','/auth/logout','/auth/password-reset/request','/auth/password-reset/confirm','/auth/invitations/accept','/auth/mfa/verify']) assert.ok(routes.includes(path),`missing ${path}`);
  console.log('Sprint 717 enterprise web authentication test passed.');
})().catch(error => { console.error(error); process.exit(1); });
