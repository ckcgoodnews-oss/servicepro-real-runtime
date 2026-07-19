'use strict';

function createReleaseIntelligenceController({ service }) {
  return {
    evaluateRisk: async (req, res, next) => {
      try {
        const result = await service.evaluateRisk(req.body || {});
        res.status(result.blocked ? 409 : 200).json(result);
      } catch (error) {
        next(error);
      }
    },

    analyzePerformance: async (req, res, next) => {
      try {
        const records = Array.isArray(req.body)
          ? req.body
          : req.body?.records || [];

        res.json(await service.analyzePerformance(records));
      } catch (error) {
        next(error);
      }
    },
  };
}

module.exports = {
  createReleaseIntelligenceController,
};
