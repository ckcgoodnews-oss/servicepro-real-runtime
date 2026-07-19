'use strict';

const express = require('express');

function createReleasePolicyOptimizationRouter({
  controller,
}) {
  const router = express.Router();

  router.post(
    '/simulate',
    controller.simulate,
  );

  router.post(
    '/optimize',
    controller.optimize,
  );

  return router;
}

module.exports = {
  createReleasePolicyOptimizationRouter,
};
