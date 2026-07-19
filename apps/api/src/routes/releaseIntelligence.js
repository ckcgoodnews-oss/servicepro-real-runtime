'use strict';

const express = require('express');

function createReleaseIntelligenceRouter({ controller }) {
  const router = express.Router();

  router.post(
    '/risk/evaluate',
    controller.evaluateRisk,
  );

  router.post(
    '/performance/analyze',
    controller.analyzePerformance,
  );

  return router;
}

module.exports = {
  createReleaseIntelligenceRouter,
};
