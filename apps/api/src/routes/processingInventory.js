const { sendJson } = require('../utils/http');

function repo(req) { return req.context.repositories.processingInventory; }
function filters(req) {
  return {
    tenantId: req.body.tenantId || req.context.tenantId || '',
    activityId: req.body.activityId || '',
    dpiaId: req.body.dpiaId || '',
    status: req.body.status || ''
  };
}
function wrap(promise, res, status = 200) {
  Promise.resolve(promise)
    .then(data => sendJson(res, status, { data }))
    .catch(err => sendJson(res, err.status || 500, { error: { code: err.code || 'error', message: err.message, details: err.details || {} } }));
}

module.exports = {
  listActivities(req, res) { wrap(repo(req).listActivities(filters(req)), res); },
  createActivity(req, res) { wrap(repo(req).createActivity({ ...req.body, tenantId: req.body.tenantId || req.context.tenantId || '' }), res, 201); },
  reviewActivity(req, res, id) { wrap(repo(req).reviewActivity(id), res); },
  createDataCategory(req, res, activityId) { wrap(repo(req).createDataCategory({ ...req.body, activityId, tenantId: req.body.tenantId || req.context.tenantId || '' }), res, 201); },
  listDataCategories(req, res, activityId) { wrap(repo(req).listDataCategories(activityId), res); },
  createSystemMapping(req, res, activityId) { wrap(repo(req).createSystemMapping({ ...req.body, activityId, tenantId: req.body.tenantId || req.context.tenantId || '' }), res, 201); },
  listSystemMappings(req, res, activityId) { wrap(repo(req).listSystemMappings(activityId), res); },
  createDpia(req, res, activityId) { wrap(repo(req).createDpia({ ...req.body, activityId, tenantId: req.body.tenantId || req.context.tenantId || '' }), res, 201); },
  listDpias(req, res) { wrap(repo(req).listDpias(filters(req)), res); },
  submitDpia(req, res, id) { wrap(repo(req).submitDpia(id), res); },
  decideDpia(req, res, id) { wrap(repo(req).decideDpia({ ...req.body, dpiaId: id, tenantId: req.body.tenantId || req.context.tenantId || '' }), res, 201); },
  createTask(req, res, dpiaId) { wrap(repo(req).createTask({ ...req.body, dpiaId, tenantId: req.body.tenantId || req.context.tenantId || '' }), res, 201); },
  listTasks(req, res) { wrap(repo(req).listTasks(filters(req)), res); },
  completeTask(req, res, id) { wrap(repo(req).completeTask(id), res); },
  metrics(req, res) { wrap(repo(req).metrics(req.body.tenantId || req.context.tenantId || ''), res); }
};
