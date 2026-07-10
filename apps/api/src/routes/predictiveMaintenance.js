const { sendJson } = require('../utils/http');

function tenant(req) { return req.context.tenantId; }
function repo(req) { return req.context.repositories.predictiveMaintenance; }

function filters(req) {
  return {
    assetId: req.body.assetId || '',
    customerId: req.body.customerId || '',
    riskBand: req.body.riskBand || '',
    status: req.body.status || ''
  };
}

function listModels(req, res) {
  Promise.resolve(repo(req).listModels(tenant(req))).then(data => sendJson(res, 200, { data }));
}

function createModel(req, res) {
  Promise.resolve(repo(req).createModel(tenant(req), req.body))
    .then(data => sendJson(res, 201, { data }))
    .catch(err => sendJson(res, err.status || 500, { error: { code: err.code || 'error', message: err.message, details: err.details || {} } }));
}

function generatePrediction(req, res) {
  Promise.resolve(repo(req).generatePrediction(tenant(req), req.body))
    .then(data => sendJson(res, 201, { data }))
    .catch(err => sendJson(res, err.status || 500, { error: { code: err.code || 'error', message: err.message, details: err.details || {} } }));
}

function listPredictions(req, res) {
  Promise.resolve(repo(req).listPredictions(tenant(req), filters(req))).then(data => sendJson(res, 200, { data }));
}

function getPrediction(req, res, id) {
  Promise.resolve(repo(req).findPredictionById(tenant(req), id)).then(data => {
    if (!data) return sendJson(res, 404, { error: { code: 'not_found', message: 'Prediction not found' } });
    return sendJson(res, 200, { data });
  });
}

function markConverted(req, res, id) {
  Promise.resolve(repo(req).markConverted(tenant(req), id, req.body))
    .then(data => data ? sendJson(res, 200, { data }) : sendJson(res, 404, { error: { code: 'not_found', message: 'Prediction not found' } }));
}

function dismiss(req, res, id) {
  Promise.resolve(repo(req).dismiss(tenant(req), id, req.body))
    .then(data => data ? sendJson(res, 200, { data }) : sendJson(res, 404, { error: { code: 'not_found', message: 'Prediction not found' } }));
}

module.exports = {
  listModels,
  createModel,
  generatePrediction,
  listPredictions,
  getPrediction,
  markConverted,
  dismiss
};
