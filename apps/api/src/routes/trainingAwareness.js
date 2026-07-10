const { sendJson } = require('../utils/http');

function repo(req) { return req.context.repositories.trainingAwareness; }
function filters(req) {
  return {
    tenantId: req.body.tenantId || req.context.tenantId || '',
    campaignId: req.body.campaignId || '',
    courseId: req.body.courseId || '',
    subjectId: req.body.subjectId || '',
    status: req.body.status || '',
    courseType: req.body.courseType || ''
  };
}
function wrap(promise, res, status = 200) {
  Promise.resolve(promise)
    .then(data => sendJson(res, status, { data }))
    .catch(err => sendJson(res, err.status || 500, { error: { code: err.code || 'error', message: err.message, details: err.details || {} } }));
}

module.exports = {
  listCourses(req, res) { wrap(repo(req).listCourses(filters(req)), res); },
  createCourse(req, res) { wrap(repo(req).createCourse({ ...req.body, tenantId: req.body.tenantId || req.context.tenantId || '' }), res, 201); },
  createCampaign(req, res) { wrap(repo(req).createCampaign({ ...req.body, tenantId: req.body.tenantId || req.context.tenantId || '' }), res, 201); },
  listCampaigns(req, res) { wrap(repo(req).listCampaigns(filters(req)), res); },
  scheduleCampaign(req, res, id) { wrap(repo(req).scheduleCampaign(id, req.body.startsAt || '', req.body.dueAt || ''), res); },
  activateCampaign(req, res, id) { wrap(repo(req).activateCampaign(id), res); },
  createAssignment(req, res) { wrap(repo(req).createAssignment({ ...req.body, tenantId: req.body.tenantId || req.context.tenantId || '' }), res, 201); },
  listAssignments(req, res) { wrap(repo(req).listAssignments(filters(req)), res); },
  startAssignment(req, res, id) { wrap(repo(req).startAssignment(id), res); },
  createEvidence(req, res, assignmentId) { wrap(repo(req).createEvidence({ ...req.body, assignmentId, tenantId: req.body.tenantId || req.context.tenantId || '' }), res, 201); },
  completeAssignment(req, res, id) { wrap(repo(req).completeAssignment(id, req.body.score === undefined ? null : req.body.score), res); },
  markOverdue(req, res) { wrap(repo(req).markOverdue(req.body.asOf || new Date().toISOString()), res); },
  createReminder(req, res, assignmentId) { wrap(repo(req).createReminder({ ...req.body, assignmentId, tenantId: req.body.tenantId || req.context.tenantId || '' }), res, 201); },
  sendReminder(req, res, id) { wrap(repo(req).sendReminder(id), res); },
  failReminder(req, res, id) { wrap(repo(req).failReminder(id, req.body.reason || ''), res); },
  createException(req, res, assignmentId) { wrap(repo(req).createException({ ...req.body, assignmentId, tenantId: req.body.tenantId || req.context.tenantId || '' }), res, 201); },
  approveException(req, res, id) { wrap(repo(req).approveException(id, req.body.decidedBy || req.context.userId || ''), res); },
  rejectException(req, res, id) { wrap(repo(req).rejectException(id, req.body.decidedBy || req.context.userId || ''), res); },
  metrics(req, res) { wrap(repo(req).metrics(req.body.tenantId || req.context.tenantId || ''), res); }
};
