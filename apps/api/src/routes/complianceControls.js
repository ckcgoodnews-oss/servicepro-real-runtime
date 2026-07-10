const { sendJson } = require('../utils/http');

function repo(req) { return req.context.repositories.complianceControls; }
function filters(req) {
  return {
    frameworkId: req.body.frameworkId || '',
    controlId: req.body.controlId || '',
    status: req.body.status || '',
    severity: req.body.severity || ''
  };
}
function wrap(promise, res, status = 200) {
  Promise.resolve(promise)
    .then(data => sendJson(res, status, { data }))
    .catch(err => sendJson(res, err.status || 500, { error: { code: err.code || 'error', message: err.message, details: err.details || {} } }));
}

module.exports = {
  listFrameworks(req, res) { wrap(repo(req).listFrameworks(filters(req)), res); },
  createFramework(req, res) { wrap(repo(req).createFramework(req.body), res, 201); },
  listControls(req, res) { wrap(repo(req).listControls(filters(req)), res); },
  createControl(req, res, frameworkId) { wrap(repo(req).createControl({ ...req.body, frameworkId }), res, 201); },
  listEvidence(req, res, controlId) { wrap(repo(req).listEvidence(controlId), res); },
  createEvidence(req, res, controlId) { wrap(repo(req).createEvidence({ ...req.body, controlId }), res, 201); },
  createTestRun(req, res, controlId) { wrap(repo(req).createTestRun({ ...req.body, controlId }), res, 201); },
  listTestRuns(req, res, controlId) { wrap(repo(req).listTestRuns(controlId), res); },
  startTestRun(req, res, id) { wrap(repo(req).startTestRun(id), res); },
  completeTestRun(req, res, id) { wrap(repo(req).completeTestRun(id, req.body.passed === true, req.body.resultSummary || ''), res); },
  listGaps(req, res) { wrap(repo(req).listGaps(filters(req)), res); },
  createGap(req, res, controlId) { wrap(repo(req).createGap({ ...req.body, controlId }), res, 201); },
  closeGap(req, res, id) { wrap(repo(req).closeGap(id), res); },
  acceptGap(req, res, id) { wrap(repo(req).acceptGap(id), res); },
  createCorrectiveAction(req, res, gapId) { wrap(repo(req).createCorrectiveAction({ ...req.body, gapId }), res, 201); },
  listCorrectiveActions(req, res, gapId) { wrap(repo(req).listCorrectiveActions(gapId), res); },
  completeCorrectiveAction(req, res, id) { wrap(repo(req).completeCorrectiveAction(id), res); },
  coverage(req, res) { wrap(repo(req).coverage(req.body.frameworkId || ''), res); }
};
