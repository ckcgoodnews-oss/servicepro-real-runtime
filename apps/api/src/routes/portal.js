const { sendJson } = require('../utils/http');
const { verifyPassword } = require('../services/passwordService');
const { issuePortalToken } = require('../services/portalTokenService');

async function login(req, res) {
  const { email, password } = req.body || {};
  if (!email || !password) {
    return sendJson(res, 400, { error: { code: 'validation_failed', message: 'email and password are required' } });
  }

  const account = await req.context.repositories.portalAccounts.findByEmail(req.context.tenantId, email);
  if (!account || account.enabled === false || !(await verifyPassword(password, account.passwordHash))) {
    return sendJson(res, 401, { error: { code: 'unauthorized', message: 'Invalid portal email or password' } });
  }

  const token = issuePortalToken({
    portalAccountId: account.id,
    customerId: account.customerId,
    tenantId: account.tenantId,
    email: account.email
  });

  return sendJson(res, 200, {
    data: {
      accessToken: token,
      tokenType: 'Bearer',
      account: {
        id: account.id,
        tenantId: account.tenantId,
        customerId: account.customerId,
        email: account.email
      }
    }
  });
}

function me(req, res) {
  return sendJson(res, 200, {
    data: {
      portalAccountId: req.context.portalAccountId,
      customerId: req.context.portalCustomerId,
      tenantId: req.context.tenantId,
      email: req.context.portalEmail
    }
  });
}

function createAccount(req, res) {
  Promise.resolve()
    .then(() => req.context.repositories.portalAccounts.create(req.context.tenantId, req.body))
    .then(account => sendJson(res, 201, { data: { id: account.id, tenantId: account.tenantId, customerId: account.customerId, email: account.email, enabled: account.enabled } }))
    .catch(err => sendJson(res, err.status || 500, { error: { code: err.code || 'error', message: err.message } }));
}

function listAccounts(req, res) {
  Promise.resolve(req.context.repositories.portalAccounts.list(req.context.tenantId))
    .then(accounts => sendJson(res, 200, { data: accounts.map(a => ({ id: a.id, tenantId: a.tenantId, customerId: a.customerId, email: a.email, enabled: a.enabled })) }));
}

function listBookings(req, res) {
  const customerId = req.context.portalCustomerId;
  Promise.resolve(req.context.repositories.portalBookings.listForCustomer(req.context.tenantId, customerId))
    .then(data => sendJson(res, 200, { data }));
}

function createBooking(req, res) {
  Promise.resolve()
    .then(() => req.context.repositories.portalBookings.create(req.context.tenantId, {
      ...req.body,
      customerId: req.context.portalCustomerId,
      portalAccountId: req.context.portalAccountId
    }))
    .then(data => sendJson(res, 201, { data }))
    .catch(err => sendJson(res, err.status || 500, { error: { code: err.code || 'error', message: err.message } }));
}

function listInvoices(req, res) {
  Promise.resolve(req.context.repositories.invoices.list(req.context.tenantId))
    .then(invoices => sendJson(res, 200, { data: invoices.filter(i => i.customerId === req.context.portalCustomerId) }));
}

function listEstimates(req, res) {
  Promise.resolve(req.context.repositories.estimates.list(req.context.tenantId))
    .then(estimates => sendJson(res, 200, { data: estimates.filter(e => e.customerId === req.context.portalCustomerId) }));
}

module.exports = { login, me, createAccount, listAccounts, listBookings, createBooking, listInvoices, listEstimates };
