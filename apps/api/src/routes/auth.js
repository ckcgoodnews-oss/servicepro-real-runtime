const { sendJson } = require('../utils/http');
const { verifyPassword } = require('../services/passwordService');
const { issueAccessToken } = require('../services/tokenService');
const { permissionsForRoles } = require('../auth/permissions');

async function login(req, res) {
  const { email, password } = req.body || {};
  if (!email || !password) {
    return sendJson(res, 400, { error: { code: 'validation_failed', message: 'email and password are required' } });
  }

  const user = await req.context.repositories.users.findByEmail(req.context.tenantId, email);
  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    await req.context.repositories.authEvents.log({
      tenantId: req.context.tenantId,
      userId: null,
      eventType: 'auth.login_failed',
      email,
      status: 'failed'
    });
    return sendJson(res, 401, { error: { code: 'unauthorized', message: 'Invalid email or password' } });
  }

  const rolePermissions = permissionsForRoles(user.roles || []);
  const explicitPermissions = user.permissions || [];
  const permissions = Array.from(new Set([...rolePermissions, ...explicitPermissions]));

  const token = issueAccessToken({
    userId: user.id,
    tenantId: user.tenantId,
    email: user.email,
    roles: user.roles || [],
    permissions
  });

  await req.context.repositories.authEvents.log({
    tenantId: user.tenantId,
    userId: user.id,
    eventType: 'auth.login_success',
    email: user.email,
    status: 'success'
  });

  return sendJson(res, 200, {
    data: {
      accessToken: token,
      tokenType: 'Bearer',
      user: {
        id: user.id,
        tenantId: user.tenantId,
        email: user.email,
        name: user.name,
        roles: user.roles || [],
        permissions
      }
    }
  });
}

function me(req, res) {
  return sendJson(res, 200, {
    data: {
      userId: req.context.userId,
      tenantId: req.context.tenantId,
      email: req.context.email,
      roles: req.context.roles || [],
      permissions: req.context.permissions || []
    }
  });
}

function authz(req, res) {
  return sendJson(res, 200, {
    data: {
      tenantId: req.context.tenantId,
      userId: req.context.userId,
      roles: req.context.roles || [],
      permissions: req.context.permissions || []
    }
  });
}

module.exports = { login, me, authz };
