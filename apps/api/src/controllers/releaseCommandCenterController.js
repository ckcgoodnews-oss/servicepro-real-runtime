'use strict';

function createReleaseCommandCenterController({ service }) {
  return {
    getEnvironmentStatuses: async (req, res, next) => {
      try {
        res.json(await service.getEnvironmentStatuses());
      } catch (error) {
        next(error);
      }
    },

    getTimeline: async (req, res, next) => {
      try {
        const limit = Math.min(
          Number(req.query.limit || 100),
          500,
        );

        res.json(await service.getTimeline(limit));
      } catch (error) {
        next(error);
      }
    },

    getAuditRecords: async (req, res, next) => {
      try {
        const limit = Math.min(
          Number(req.query.limit || 100),
          500,
        );

        res.json(
          await service.getAuditRecords({
            actor: req.query.actor || null,
            action: req.query.action || null,
            resourceType: req.query.resourceType || null,
            outcome: req.query.outcome || null,
            limit,
          }),
        );
      } catch (error) {
        next(error);
      }
    },

    buildDashboard: async (req, res, next) => {
      try {
        res.json(service.buildDashboard(req.body || {}));
      } catch (error) {
        next(error);
      }
    },

    recordAudit: async (req, res, next) => {
      try {
        res.status(201).json(
          await service.recordAudit(req.body),
        );
      } catch (error) {
        next(error);
      }
    },
  };
}

module.exports = {
  createReleaseCommandCenterController,
};
