const { sendJson } = require('../utils/http');

function repo(req) { return req.context.repositories.contracts; }

function filters(req) {
  return {
    tenantId: req.body.tenantId || req.context.tenantId || '',
    status: req.body.status || '',
    agreementId: req.body.agreementId || ''
  };
}

function wrap(promise, res, status = 200) {
  Promise.resolve(promise)
    .then(data => sendJson(res, status, { data }))
    .catch(err => sendJson(res, err.status || 500, { error: { code: err.code || 'error', message: err.message, details: err.details || {} } }));
}

module.exports = {
  listAgreements(req, res) { wrap(repo(req).listAgreements(filters(req)), res); },
  createAgreement(req, res) { wrap(repo(req).createAgreement({ ...req.body, tenantId: req.body.tenantId || req.context.tenantId || '' }), res, 201); },
  activateAgreement(req, res, id) { wrap(repo(req).activateAgreement(id), res); },
  terminateAgreement(req, res, id) { wrap(repo(req).terminateAgreement(id), res); },
  listOrderForms(req, res, agreementId) { wrap(repo(req).listOrderForms(agreementId), res); },
  createOrderForm(req, res, agreementId) { wrap(repo(req).createOrderForm({ ...req.body, agreementId }), res, 201); },
  listTerms(req, res, agreementId) { wrap(repo(req).listTerms(agreementId), res); },
  createTerm(req, res, agreementId) { wrap(repo(req).createTerm({ ...req.body, agreementId }), res, 201); },
  listAmendments(req, res, agreementId) { wrap(repo(req).listAmendments(agreementId), res); },
  createAmendment(req, res, agreementId) { wrap(repo(req).createAmendment({ ...req.body, agreementId }), res, 201); },
  executeAmendment(req, res, id) { wrap(repo(req).executeAmendment(id), res); },
  listObligations(req, res) { wrap(repo(req).listObligations(filters(req)), res); },
  createObligation(req, res) { wrap(repo(req).createObligation(req.body), res, 201); },
  fulfillObligation(req, res, id) { wrap(repo(req).fulfillObligation(id, req.body.evidenceUrl || ''), res); },
  renewalWindow(req, res, id) { wrap(repo(req).renewalWindow(id, req.body.asOf), res); },
  value(req, res, id) { wrap(repo(req).value(id), res); },
  portfolio(req, res) { wrap(repo(req).portfolio(req.body.tenantId || req.context.tenantId || ''), res); }
};
