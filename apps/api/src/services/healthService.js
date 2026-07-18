'use strict';

const { version: packageVersion } = require('../../../../package.json');
const { validateRuntimeConfig } = require('./configValidationService');
const { getRepositories } = require('../repositories/repositoryFactory');

function resolveApplicationVersion() {
  const environmentVersion =
    typeof process.env.APP_VERSION === 'string'
      ? process.env.APP_VERSION.trim()
      : '';

  return environmentVersion || packageVersion;
}

function buildHealth() {
  const environmentVersion =
    typeof process.env.APP_VERSION === 'string'
      ? process.env.APP_VERSION.trim()
      : '';

  return {
    ok: true,
    app: process.env.APP_NAME || 'ServicePro',
    version: environmentVersion || packageVersion,
    versionSource: environmentVersion ? 'APP_VERSION' : 'package.json',
    packageVersion,
    environmentVersion: environmentVersion || null,
    environment: process.env.NODE_ENV || 'development',
    store: process.env.DATA_STORE || 'json',
    uptimeSeconds: Math.round(process.uptime()),
    timestamp: new Date().toISOString()
  };
}

async function buildReadiness(options = {}) {
  const configuration =
    options.configuration || validateRuntimeConfig();

  const repositories =
    options.repositories || getRepositories();

  const store =
    options.store || repositories.store;

  let dataStoreReady = false;

  try {
    if (!store) {
      throw new Error('Repository store is not configured');
    }

    if (store.type === 'postgres') {
      if (typeof store.query !== 'function') {
        throw new Error('PostgreSQL store does not provide query()');
      }

      await store.query('SELECT 1 AS ready');
    } else if (typeof store.read === 'function') {
      await Promise.resolve(store.read());
    } else {
      throw new Error(
        `Unsupported data store readiness interface: ${
          store.type || 'unknown'
        }`
      );
    }

    dataStoreReady = true;
  } catch (error) {
    dataStoreReady = false;
  }

  const checks = {
    configuration: Boolean(configuration && configuration.ok),
    runtime: true,
    dataStore: dataStoreReady
  };

  const configurationErrors = Array.isArray(configuration?.errors)
    ? configuration.errors
    : [];

  const configurationWarnings = Array.isArray(configuration?.warnings)
    ? configuration.warnings
    : [];

  const issues = [...configurationErrors];

  if (!dataStoreReady) {
    issues.push('Data store check failed');
  }

  return {
    ready: Object.values(checks).every(Boolean),
    checks,
    store: store?.type || process.env.DATA_STORE || 'json',
    issues,
    warnings: configurationWarnings,
    timestamp: new Date().toISOString()
  };
}

function readinessHttpStatus(readiness) {
  return readiness?.ready === true ? 200 : 503;
}

module.exports = {
  buildHealth,
  buildReadiness,
  readinessHttpStatus,
  resolveApplicationVersion
};