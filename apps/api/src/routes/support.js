const { sendJson } = require('../utils/http');

function repo(req) { return req.context.repositories.support; }

function filters(req) {
  return {
    tenantId: req.body.tenantId || req.context.tenantId || '',
    status: req.body.status || '',
    priority: req.body.priority || '',
    category: req.body.category || '',
    ticketId: req.body.ticketId || ''
  };
}

function wrap(promise, res, status = 200) {
  Promise.resolve(promise)
    .then(data => sendJson(res, status, { data }))
    .catch(err => sendJson(res, err.status || 500, { error: { code: err.code || 'error', message: err.message, details: err.details || {} } }));
}

module.exports = {
  listSlaPolicies(req, res) { wrap(repo(req).listSlaPolicies(filters(req)), res); },
  createSlaPolicy(req, res) { wrap(repo(req).createSlaPolicy(req.body), res, 201); },
  listTickets(req, res) { wrap(repo(req).listTickets(filters(req)), res); },
  createTicket(req, res) { wrap(repo(req).createTicket({ ...req.body, tenantId: req.body.tenantId || req.context.tenantId || '' }), res, 201); },
  transitionTicket(req, res, id) { wrap(repo(req).transitionTicket(id, req.body.status), res); },
  markFirstResponse(req, res, id) { wrap(repo(req).markFirstResponse(id), res); },
  evaluateSla(req, res, id) { wrap(repo(req).evaluateSla(id, req.body.asOf), res); },
  listComments(req, res, id) { wrap(repo(req).listComments(id), res); },
  createComment(req, res, id) { wrap(repo(req).createComment({ ...req.body, ticketId: id }), res, 201); },
  listEscalations(req, res) { wrap(repo(req).listEscalations(filters(req)), res); },
  createEscalation(req, res) { wrap(repo(req).createEscalation(req.body), res, 201); },
  acknowledgeEscalation(req, res, id) { wrap(repo(req).acknowledgeEscalation(id, req.body.actor || req.context.userId || ''), res); },
  resolveEscalation(req, res, id) { wrap(repo(req).resolveEscalation(id, req.body.actor || req.context.userId || ''), res); },
  listArticles(req, res) { wrap(repo(req).listArticles(filters(req)), res); },
  createArticle(req, res) { wrap(repo(req).createArticle(req.body), res, 201); },
  recordHealthSignal(req, res) { wrap(repo(req).recordHealthSignal(req.body), res, 201); },
  customerHealth(req, res, tenantId) { wrap(repo(req).customerHealth(tenantId || req.context.tenantId || ''), res); }
};
