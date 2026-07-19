'use strict';

function createProductionReadinessController({ service }) {
  return {
    evaluateReadiness: async (req, res, next) => {
      try {
        const report = await service.evaluateReadiness(
          req.body || {},
        );
        res.status(report.ready ? 200 : 409).json(report);
      } catch (error) {
        next(error);
      }
    },

    evaluateSecurity: async (req, res, next) => {
      try {
        const report = await service.evaluateSecurity(
          req.body || {},
        );
        res.status(report.hardened ? 200 : 409).json(report);
      } catch (error) {
        next(error);
      }
    },
  };
}

module.exports = {
  createProductionReadinessController,
};
