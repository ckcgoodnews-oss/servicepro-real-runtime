'use strict';

const express = require('express');

function createReleaseCommandCenterRouter({ controller }) {
  const router = express.Router();

  router.get(
    '/environments',
    controller.getEnvironmentStatuses,
  );

  router.get(
    '/timeline',
    controller.getTimeline,
  );

  router.get(
    '/audit',
    controller.getAuditRecords,
  );

  router.post(
    '/dashboard/build',
    controller.buildDashboard,
  );

  router.post(
    '/audit',
    controller.recordAudit,
  );

  return router;
}

module.exports = {
  createReleaseCommandCenterRouter,
};
