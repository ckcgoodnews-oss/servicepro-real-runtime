const { sendJson } = require('../utils/http');

function tenant(req) { return req.context.tenantId; }
function repo(req) { return req.context.repositories.complianceEvidence; }
function filters(req) {
  return {
    frameworkId: req.body.frameworkId || '',
    packageId: req.body.packageId || '',
    status: req.body.status || '',
    controlId: req.body.controlId || '',
    evidenceItemId: req.body.evidenceItemId || ''
  };
}

function wrap(promise, res, status = 200) {
  Promise.resolve(promise)
    .then(data => sendJson(res, status, { data }))
    .catch(err => sendJson(res, err.status || 500, { error: { code: err.code || 'error', message: err.message, details: err.details || {} } }));
}

module.exports = {
  listFrameworks(req, res) { wrap(repo(req).listFrameworks(tenant(req)), res); },
  createFramework(req, res) { wrap(repo(req).createFramework(tenant(req), req.body), res, 201); },
  listControls(req, res) { wrap(repo(req).listControls(tenant(req), filters(req)), res); },
  createControl(req, res) { wrap(repo(req).createControl(tenant(req), req.body), res, 201); },
  listPackages(req, res) { wrap(repo(req).listPackages(tenant(req)), res); },
  createPackage(req, res) { wrap(repo(req).createPackage(tenant(req), req.body), res, 201); },
  listEvidenceItems(req, res) { wrap(repo(req).listEvidenceItems(tenant(req), filters(req)), res); },
  createEvidenceItem(req, res) { wrap(repo(req).createEvidenceItem(tenant(req), req.body), res, 201); },
  reviewEvidenceItem(req, res, id) {
    Promise.resolve(repo(req).reviewEvidenceItem(tenant(req), id, req.body))
      .then(data => data ? sendJson(res, 200, { data }) : sendJson(res, 404, { error: { code: 'not_found', message: 'Evidence item not found' } }))
      .catch(err => sendJson(res, err.status || 500, { error: { code: err.code || 'error', message: err.message, details: err.details || {} } }));
  },
  createMapping(req, res) { wrap(repo(req).createMapping(tenant(req), req.body), res, 201); },
  listMappings(req, res) { wrap(repo(req).listMappings(tenant(req), filters(req)), res); },
  createAttestation(req, res) { wrap(repo(req).createAttestation(tenant(req), req.body), res, 201); },
  approveAttestation(req, res, id) {
    Promise.resolve(repo(req).approveAttestation(tenant(req), id, req.body.approvedBy || req.context.userId || ''))
      .then(data => data ? sendJson(res, 200, { data }) : sendJson(res, 404, { error: { code: 'not_found', message: 'Attestation not found' } }))
      .catch(err => sendJson(res, err.status || 500, { error: { code: err.code || 'error', message: err.message, details: err.details || {} } }));
  },
  createExport(req, res) { wrap(repo(req).createExport(tenant(req), req.body), res, 201); },
  completeExport(req, res, id) {
    Promise.resolve(repo(req).completeExport(tenant(req), id, req.body.artifactUri || ''))
      .then(data => data ? sendJson(res, 200, { data }) : sendJson(res, 404, { error: { code: 'not_found', message: 'Evidence export not found' } }))
      .catch(err => sendJson(res, err.status || 500, { error: { code: err.code || 'error', message: err.message, details: err.details || {} } }));
  },
  score(req, res) { wrap(repo(req).score(tenant(req), filters(req)), res); }
};
