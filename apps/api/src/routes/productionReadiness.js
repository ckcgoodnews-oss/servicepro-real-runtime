'use strict';

const express = require('express');

function createProductionReadinessRouter({ controller }) {
  const router = express.Router();

  router.post(
    '/evaluate',
    controller.evaluateReadiness,
  );

  router.post(
    '/security/evaluate',
    controller.evaluateSecurity,
  );

  return router;
}

module.exports = {
  createProductionReadinessRouter,
};
