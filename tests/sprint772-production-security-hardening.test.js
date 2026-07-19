'use strict';

const assert = require('node:assert');
const {
  evaluateSecurityHardening,
} = require('../scripts/lib/security-hardening-engine');

function run() {
  const policy = {
    requiredSecrets: [
      'DATABASE_URL',
      'SESSION_SECRET',
    ],
  };

  const hardened = evaluateSecurityHardening({
    headers: {
      'Content-Security-Policy': "default-src 'self'",
      'Strict-Transport-Security': 'max-age=31536000',
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'Referrer-Policy': 'strict-origin',
      'Permissions-Policy': 'camera=()',
    },
    configuration: {
      nodeEnv: 'production',
      trustProxy: true,
      rateLimiting: true,
      secureCookies: true,
    },
    secrets: {
      DATABASE_URL: 'configured',
      SESSION_SECRET: 'configured',
    },
    policy,
  });

  assert.strictEqual(hardened.hardened, true);

  const unsafe = evaluateSecurityHardening({
    headers: {},
    configuration: {
      nodeEnv: 'development',
      trustProxy: false,
      rateLimiting: false,
      secureCookies: false,
    },
    secrets: {},
    policy,
  });

  assert.strictEqual(unsafe.hardened, false);
  assert.ok(unsafe.blockingFindings.length > 0);

  console.log('Sprint 772 production security hardening tests passed.');
}

run();
