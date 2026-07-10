const { sendJson } = require('../utils/http');

function paymentsRepo(req) {
  return req.context.repositories.payments;
}

function invoicesRepo(req) {
  return req.context.repositories.invoices;
}

function tenant(req) {
  return req.context.tenantId;
}

function list(req, res) {
  Promise.resolve(paymentsRepo(req).list(tenant(req))).then(data => sendJson(res, 200, { data }));
}

function create(req, res) {
  Promise.resolve()
    .then(async () => {
      const payment = await paymentsRepo(req).create(tenant(req), req.body);
      const invoice = await invoicesRepo(req).recordPayment(tenant(req), payment.invoiceId, payment.amount);
      return { payment, invoice };
    })
    .then(data => sendJson(res, 201, { data }))
    .catch(err => sendJson(res, err.status || 500, { error: { code: err.code || 'error', message: err.message } }));
}

function remove(req, res, id) {
  Promise.resolve(paymentsRepo(req).delete(tenant(req), id)).then(deleted => {
    if (!deleted) return sendJson(res, 404, { error: { code: 'not_found', message: 'Payment not found' } });
    sendJson(res, 200, { data: { deleted: true } });
  });
}

module.exports = { list, create, remove };
