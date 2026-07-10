const { sendJson } = require('../utils/http');
const { validateTransition } = require('../services/workflowService');

function tenant(req) {
  return req.context.tenantId;
}

function listRules(req, res) {
  Promise.resolve(req.context.repositories.workflows.listRules(tenant(req)))
    .then(data => sendJson(res, 200, { data }));
}

function upsertRule(req, res) {
  Promise.resolve(req.context.repositories.workflows.upsertRule(tenant(req), req.body))
    .then(data => sendJson(res, 200, { data }))
    .catch(err => sendJson(res, err.status || 500, { error: { code: err.code || 'error', message: err.message, details: err.details || {} } }));
}

function listEvents(req, res) {
  Promise.resolve(req.context.repositories.workflows.listEvents(tenant(req)))
    .then(data => sendJson(res, 200, { data }));
}

function transitionJob(req, res, id) {
  Promise.resolve()
    .then(async () => {
      const job = await req.context.repositories.jobs.findById(tenant(req), id);
      if (!job) {
        const err = new Error('Job not found');
        err.status = 404;
        err.code = 'not_found';
        throw err;
      }

      const toStatus = req.body.status || req.body.toStatus;
      const rule = await req.context.repositories.workflows.getActiveRule(tenant(req), 'job');
      validateTransition(rule.definition, job.status, toStatus);

      const updated = await req.context.repositories.jobs.update(tenant(req), id, {
        status: toStatus
      });

      await req.context.repositories.workflows.createEvent(tenant(req), {
        entityType: 'job',
        entityId: id,
        fromStatus: job.status,
        toStatus,
        actorId: req.context.userId || '',
        notes: req.body.notes || '',
        metadata: { route: req.url }
      });

      return updated;
    })
    .then(data => sendJson(res, 200, { data }))
    .catch(err => sendJson(res, err.status || 500, { error: { code: err.code || 'error', message: err.message, details: err.details || {} } }));
}

module.exports = { listRules, upsertRule, listEvents, transitionJob };
