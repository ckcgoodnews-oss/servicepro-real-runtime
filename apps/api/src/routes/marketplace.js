const { sendJson } = require('../utils/http');

function tenant(req) { return req.context.tenantId; }
function repo(req) { return req.context.repositories.marketplace; }

function filters(req) {
  return {
    category: req.body.category || '',
    status: req.body.status || '',
    integrationId: req.body.integrationId || '',
    installationId: req.body.installationId || ''
  };
}

function wrap(promise, res, status = 200) {
  Promise.resolve(promise)
    .then(data => sendJson(res, status, { data }))
    .catch(err => sendJson(res, err.status || 500, { error: { code: err.code || 'error', message: err.message, details: err.details || {} } }));
}

module.exports = {
  listCatalog(req, res) { wrap(repo(req).listCatalog(filters(req)), res); },
  createCatalogItem(req, res) { wrap(repo(req).createCatalogItem(req.body), res, 201); },
  listInstallations(req, res) { wrap(repo(req).listInstallations(tenant(req), filters(req)), res); },
  createInstallation(req, res) { wrap(repo(req).createInstallation(tenant(req), req.body), res, 201); },
  markConnected(req, res, id) {
    Promise.resolve(repo(req).markConnected(tenant(req), id))
      .then(data => data ? sendJson(res, 200, { data }) : sendJson(res, 404, { error: { code: 'not_found', message: 'Installation not found' } }));
  },
  markFailed(req, res, id) {
    Promise.resolve(repo(req).markFailed(tenant(req), id, req.body.error || ''))
      .then(data => data ? sendJson(res, 200, { data }) : sendJson(res, 404, { error: { code: 'not_found', message: 'Installation not found' } }));
  },
  listWebhooks(req, res) { wrap(repo(req).listWebhooks(tenant(req), filters(req)), res); },
  createWebhook(req, res) { wrap(repo(req).createWebhook(tenant(req), req.body), res, 201); },
  listSyncRuns(req, res) { wrap(repo(req).listSyncRuns(tenant(req), filters(req)), res); },
  createSyncRun(req, res) { wrap(repo(req).createSyncRun(tenant(req), req.body), res, 201); },
  startSyncRun(req, res, id) {
    Promise.resolve(repo(req).startSyncRun(tenant(req), id))
      .then(data => data ? sendJson(res, 200, { data }) : sendJson(res, 404, { error: { code: 'not_found', message: 'Sync run not found' } }));
  },
  completeSyncRun(req, res, id) {
    Promise.resolve(repo(req).completeSyncRun(tenant(req), id, req.body))
      .then(data => data ? sendJson(res, 200, { data }) : sendJson(res, 404, { error: { code: 'not_found', message: 'Sync run not found' } }));
  },
  health(req, res, id) { wrap(repo(req).health(tenant(req), id), res); },
  summary(req, res) { wrap(repo(req).summary(tenant(req)), res); }
};
