const { sendJson } = require('../utils/http');

function tenant(req) { return req.context.tenantId; }
function repo(req) { return req.context.repositories.territories; }

function listTerritories(req, res) {
  Promise.resolve(repo(req).listTerritories(tenant(req))).then(data => sendJson(res, 200, { data }));
}
function createTerritory(req, res) {
  Promise.resolve(repo(req).createTerritory(tenant(req), req.body))
    .then(data => sendJson(res, 201, { data }))
    .catch(err => sendJson(res, err.status || 500, { error: { code: err.code || 'error', message: err.message, details: err.details || {} } }));
}
function listCoverageRules(req, res, territoryId = '') {
  Promise.resolve(repo(req).listCoverageRules(tenant(req), territoryId)).then(data => sendJson(res, 200, { data }));
}
function createCoverageRule(req, res, territoryId = '') {
  Promise.resolve(repo(req).createCoverageRule(tenant(req), { ...req.body, territoryId: territoryId || req.body.territoryId }))
    .then(data => sendJson(res, 201, { data }))
    .catch(err => sendJson(res, err.status || 500, { error: { code: err.code || 'error', message: err.message, details: err.details || {} } }));
}
function listTechnicianTerritories(req, res, territoryId = '') {
  Promise.resolve(repo(req).listTechnicianTerritories(tenant(req), territoryId)).then(data => sendJson(res, 200, { data }));
}
function createTechnicianTerritory(req, res, territoryId = '') {
  Promise.resolve(repo(req).createTechnicianTerritory(tenant(req), { ...req.body, territoryId: territoryId || req.body.territoryId }))
    .then(data => sendJson(res, 201, { data }))
    .catch(err => sendJson(res, err.status || 500, { error: { code: err.code || 'error', message: err.message, details: err.details || {} } }));
}
function matchAddress(req, res) {
  Promise.resolve(repo(req).matchAddress(tenant(req), req.body)).then(data => sendJson(res, 200, { data }));
}

module.exports = {
  listTerritories,
  createTerritory,
  listCoverageRules,
  createCoverageRule,
  listTechnicianTerritories,
  createTechnicianTerritory,
  matchAddress
};
