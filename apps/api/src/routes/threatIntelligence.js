const { sendJson } = require('../utils/http');
function repo(req) { return req.context.repositories.threatIntelligence; }
function filters(req) { return { tenantId: req.body.tenantId || req.context.tenantId || '', status: req.body.status || '', severity: req.body.severity || '', indicatorType: req.body.indicatorType || '', indicatorId: req.body.indicatorId || '' }; }
function wrap(promise, res, status = 200) { Promise.resolve(promise).then(data => sendJson(res, status, { data })).catch(err => sendJson(res, err.status || 500, { error: { code: err.code || 'error', message: err.message, details: err.details || {} } })); }
module.exports = {
  createFeed(req, res) { wrap(repo(req).createFeed({ ...req.body, tenantId: req.body.tenantId || req.context.tenantId || '' }), res, 201); },
  listFeeds(req, res) { wrap(repo(req).listFeeds(filters(req)), res); },
  pauseFeed(req, res, id) { wrap(repo(req).pauseFeed(id), res); },
  activateFeed(req, res, id) { wrap(repo(req).activateFeed(id), res); },
  createIndicator(req, res) { wrap(repo(req).createIndicator({ ...req.body, tenantId: req.body.tenantId || req.context.tenantId || '' }), res, 201); },
  listIndicators(req, res) { wrap(repo(req).listIndicators(filters(req)), res); },
  refreshIndicator(req, res, id) { wrap(repo(req).refreshIndicator(id), res); },
  createActor(req, res) { wrap(repo(req).createActor({ ...req.body, tenantId: req.body.tenantId || req.context.tenantId || '' }), res, 201); },
  listActors(req, res) { wrap(repo(req).listActors(filters(req)), res); },
  createCampaign(req, res) { wrap(repo(req).createCampaign({ ...req.body, tenantId: req.body.tenantId || req.context.tenantId || '' }), res, 201); },
  activateCampaign(req, res, id) { wrap(repo(req).activateCampaign(id), res); },
  createSighting(req, res) { wrap(repo(req).createSighting({ ...req.body, tenantId: req.body.tenantId || req.context.tenantId || '' }), res, 201); },
  listSightings(req, res) { wrap(repo(req).listSightings(filters(req)), res); },
  createEnrichment(req, res) { wrap(repo(req).createEnrichment({ ...req.body, tenantId: req.body.tenantId || req.context.tenantId || '' }), res, 201); },
  completeEnrichment(req, res, id) { wrap(repo(req).completeEnrichment(id, req.body.result || {}, req.body.score ?? null), res); },
  failEnrichment(req, res, id) { wrap(repo(req).failEnrichment(id, req.body.errorMessage || ''), res); },
  createWatchlist(req, res) { wrap(repo(req).createWatchlist({ ...req.body, tenantId: req.body.tenantId || req.context.tenantId || '' }), res, 201); },
  retireWatchlist(req, res, id) { wrap(repo(req).retireWatchlist(id), res); },
  metrics(req, res) { wrap(repo(req).metrics(req.body.tenantId || req.context.tenantId || ''), res); }
};
