const { sendJson } = require('../utils/http');

function repo(req) { return req.context.repositories.securityQuestionnaires; }
function filters(req) {
  return {
    tenantId: req.body.tenantId || req.context.tenantId || '',
    status: req.body.status || ''
  };
}
function wrap(promise, res, status = 200) {
  Promise.resolve(promise)
    .then(data => sendJson(res, status, { data }))
    .catch(err => sendJson(res, err.status || 500, { error: { code: err.code || 'error', message: err.message, details: err.details || {} } }));
}

module.exports = {
  listQuestionnaires(req, res) { wrap(repo(req).listQuestionnaires(filters(req)), res); },
  createQuestionnaire(req, res) { wrap(repo(req).createQuestionnaire({ ...req.body, tenantId: req.body.tenantId || req.context.tenantId || '' }), res, 201); },
  createQuestion(req, res, questionnaireId) { wrap(repo(req).createQuestion({ ...req.body, questionnaireId, tenantId: req.body.tenantId || req.context.tenantId || '' }), res, 201); },
  listQuestions(req, res, questionnaireId) { wrap(repo(req).listQuestions(questionnaireId), res); },
  approveQuestion(req, res, id) { wrap(repo(req).approveQuestion(id), res); },
  rejectQuestion(req, res, id) { wrap(repo(req).rejectQuestion(id), res); },
  createAnswer(req, res) { wrap(repo(req).createAnswer({ ...req.body, tenantId: req.body.tenantId || req.context.tenantId || '' }), res, 201); },
  listAnswers(req, res) { wrap(repo(req).listAnswers(filters(req)), res); },
  submitForReview(req, res, id) { wrap(repo(req).submitForReview(id), res); },
  createReview(req, res, questionnaireId) { wrap(repo(req).createReview({ ...req.body, questionnaireId, tenantId: req.body.tenantId || req.context.tenantId || '' }), res, 201); },
  approveReview(req, res, id) { wrap(repo(req).approveReview(id, req.body.comments || ''), res); },
  rejectReview(req, res, id) { wrap(repo(req).rejectReview(id, req.body.comments || ''), res); },
  markSent(req, res, id) { wrap(repo(req).markSent(id), res); },
  createExport(req, res, questionnaireId) { wrap(repo(req).createExport({ ...req.body, questionnaireId, tenantId: req.body.tenantId || req.context.tenantId || '' }), res, 201); },
  startExport(req, res, id) { wrap(repo(req).startExport(id), res); },
  completeExport(req, res, id) { wrap(repo(req).completeExport(id, req.body.outputUrl || ''), res); },
  metrics(req, res) { wrap(repo(req).metrics(req.body.tenantId || req.context.tenantId || ''), res); }
};
