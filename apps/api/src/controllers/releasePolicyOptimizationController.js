'use strict';

function createReleasePolicyOptimizationController({ service }) {
  return {
    simulate: async (req, res, next) => {
      try {
        res.json(await service.simulate(req.body || {}));
      } catch (error) {
        next(error);
      }
    },

    optimize: async (req, res, next) => {
      try {
        res.json(await service.optimize(req.body || {}));
      } catch (error) {
        next(error);
      }
    },
  };
}

module.exports = {
  createReleasePolicyOptimizationController,
};
