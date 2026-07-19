'use strict';

const REQUIRED_HEADERS = [
  'content-security-policy',
  'strict-transport-security',
  'x-content-type-options',
  'x-frame-options',
  'referrer-policy',
  'permissions-policy',
];

function normalizeHeaders(headers = {}) {
  return Object.fromEntries(
    Object.entries(headers).map(([key, value]) => [
      String(key).toLowerCase(),
      value,
    ]),
  );
}

function evaluateSecurityHardening({
  headers = {},
  configuration = {},
  secrets = {},
  policy,
}) {
  const normalizedHeaders = normalizeHeaders(headers);
  const findings = [];

  for (const header of REQUIRED_HEADERS) {
    if (!normalizedHeaders[header]) {
      findings.push({
        severity: 'high',
        control: `header:${header}`,
        reason: 'required_security_header_missing',
      });
    }
  }

  if (configuration.nodeEnv !== 'production') {
    findings.push({
      severity: 'critical',
      control: 'runtime:node_env',
      reason: 'node_env_not_production',
    });
  }

  if (configuration.trustProxy !== true) {
    findings.push({
      severity: 'medium',
      control: 'runtime:trust_proxy',
      reason: 'trusted_proxy_not_enabled',
    });
  }

  if (configuration.rateLimiting !== true) {
    findings.push({
      severity: 'high',
      control: 'api:rate_limiting',
      reason: 'rate_limiting_not_enabled',
    });
  }

  if (configuration.secureCookies !== true) {
    findings.push({
      severity: 'critical',
      control: 'session:secure_cookies',
      reason: 'secure_cookies_not_enabled',
    });
  }

  for (const secretName of policy.requiredSecrets || []) {
    if (!String(secrets[secretName] || '').trim()) {
      findings.push({
        severity: 'critical',
        control: `secret:${secretName}`,
        reason: 'required_secret_missing',
      });
    }
  }

  const blockingFindings = findings.filter(
    (finding) =>
      finding.severity === 'critical' ||
      finding.severity === 'high',
  );

  return {
    schemaVersion: 1,
    phase: 70,
    sprint: 772,
    control: 'production-security-hardening',
    evaluatedAt: new Date().toISOString(),
    hardened: blockingFindings.length === 0,
    findings,
    blockingFindings,
  };
}

module.exports = {
  REQUIRED_HEADERS,
  evaluateSecurityHardening,
  normalizeHeaders,
};
