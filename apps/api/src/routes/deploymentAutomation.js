'use strict';

const express = require('express');

function createDeploymentAutomationRouter({ service }) {
  const router = express.Router();

  router.post('/rollouts', async (req, res, next) => {
    try {
      const result = await service.createRollout(req.body);
      res.status(result.created ? 201 : 400).json(result);
    } catch (error) {
      next(error);
    }
  });

  router.post('/rollouts/advance', async (req, res, next) => {
    try {
      const result = await service.advanceRollout(req.body);
      res.status(result.state === 'paused' ? 409 : 200).json(result);
    } catch (error) {
      next(error);
    }
  });

  router.post('/rollbacks/evaluate', async (req, res, next) => {
    try {
      const result = await service.evaluateRollback(req.body);
      res.status(
        result.trigger.required && !result.decision.authorized
          ? 409
          : 200,
      ).json(result);
    } catch (error) {
      next(error);
    }
  });

  return router;
}

module.exports = {
  createDeploymentAutomationRouter,
};
