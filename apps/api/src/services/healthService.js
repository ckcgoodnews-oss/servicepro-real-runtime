const { version } = require('../../../../package.json');

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

function buildReadiness() {
  return {
    ready: true,
    checks: {
      configuration: true,
      runtime: true
    },
    timestamp: new Date().toISOString()
  };
}

module.exports = { buildHealth, buildReadiness };
