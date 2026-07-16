const { version } = require('../../../../package.json');
const { validateRuntimeConfig } = require('./configValidationService');
const { getRepositories } = require('../repositories/repositoryFactory');

function buildHealth() {
  return {
    ok: true,
    app: process.env.APP_NAME || 'ServicePro',
    version: process.env.APP_VERSION || version,
    environment: process.env.NODE_ENV || 'development',
    store: process.env.DATA_STORE || 'json',
    uptimeSeconds: Math.round(process.uptime()),
    timestamp: new Date().toISOString()
  };
}

async function buildReadiness(options = {}) {
  const configuration = options.configuration || validateRuntimeConfig();
  const store = options.store || getRepositories().store;
  let dataStore = false;

  try {
    if (store.type === 'postgres') await store.query('SELECT 1 AS ready');
    else store.read();
    dataStore = true;
  } catch (_) {
    dataStore = false;
  }

  const checks = {
    configuration: configuration.ok,
    runtime: true,
    dataStore
  };

  return {
    ready: Object.values(checks).every(Boolean),
    checks,
    store: store.type || process.env.DATA_STORE || 'json',
    issues: [...configuration.errors, ...(dataStore ? [] : ['Data store check failed'])],
    warnings: configuration.warnings,
    timestamp: new Date().toISOString()
  };
}

function readinessHttpStatus(readiness) {
  return readiness.ready ? 200 : 503;
}

module.exports = { buildHealth, buildReadiness, readinessHttpStatus };
