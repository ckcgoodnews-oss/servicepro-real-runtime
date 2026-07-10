const { sendJson } = require('../utils/http');

function repo(req) { return req.context.repositories.partners; }

function filters(req) {
  return {
    status: req.body.status || '',
    partnerType: req.body.partnerType || '',
    partnerId: req.body.partnerId || ''
  };
}

function wrap(promise, res, status = 200) {
  Promise.resolve(promise)
    .then(data => sendJson(res, status, { data }))
    .catch(err => sendJson(res, err.status || 500, { error: { code: err.code || 'error', message: err.message, details: err.details || {} } }));
}

module.exports = {
  listPartners(req, res) { wrap(repo(req).listPartners(filters(req)), res); },
  createPartner(req, res) { wrap(repo(req).createPartner(req.body), res, 201); },
  listResellerTenants(req, res) { wrap(repo(req).listResellerTenants(req.body.partnerId || ''), res); },
  createResellerTenant(req, res) { wrap(repo(req).createResellerTenant(req.body), res, 201); },
  listReferrals(req, res) { wrap(repo(req).listReferrals(filters(req)), res); },
  createReferral(req, res) { wrap(repo(req).createReferral(req.body), res, 201); },
  acceptReferral(req, res, id) { wrap(repo(req).acceptReferral(id), res); },
  markReferralWon(req, res, id) { wrap(repo(req).markReferralWon(id, req.body.tenantId || ''), res); },
  listCommissionRules(req, res) { wrap(repo(req).listCommissionRules(req.body.partnerId || ''), res); },
  createCommissionRule(req, res) { wrap(repo(req).createCommissionRule(req.body), res, 201); },
  createCommission(req, res) { wrap(repo(req).createCommissionFromRule(req.body), res, 201); },
  listCommissions(req, res) { wrap(repo(req).listCommissions(filters(req)), res); },
  approveCommission(req, res, id) { wrap(repo(req).approveCommission(id, req.body.approvedBy || req.context.userId || ''), res); },
  createPayoutBatch(req, res) { wrap(repo(req).createPayoutBatch(req.body), res, 201); },
  approvePayout(req, res, id) { wrap(repo(req).approvePayout(id, req.body.approvedBy || req.context.userId || ''), res); },
  markPayoutPaid(req, res, id) { wrap(repo(req).markPayoutPaid(id), res); },
  performance(req, res, id) { wrap(repo(req).performance(id), res); }
};
