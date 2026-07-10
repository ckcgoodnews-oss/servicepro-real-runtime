const { validationError } = require('../errors/domainError');

const POLICY_STATUSES = ['draft', 'active', 'disabled'];
const MFA_MODES = ['off', 'optional', 'required', 'required_for_admins'];
const DECISION_RESULTS = ['allow', 'deny', 'challenge'];
const DATA_RESIDENCY_REGIONS = ['us', 'eu', 'ca', 'uk', 'au', 'custom'];

function normalizeIpList(list = []) {
  if (!Array.isArray(list)) return [];
  return list.map(x => String(x).trim()).filter(Boolean);
}

function normalizeTenantSecurityPolicyInput(input = {}) {
  if (!input.name) throw validationError('name is required');

  const status = input.status || 'active';
  const mfaMode = input.mfaMode || 'optional';
  const dataResidencyRegion = input.dataResidencyRegion || 'us';

  if (!POLICY_STATUSES.includes(status)) throw validationError(`Unsupported policy status: ${status}`);
  if (!MFA_MODES.includes(mfaMode)) throw validationError(`Unsupported MFA mode: ${mfaMode}`);
  if (!DATA_RESIDENCY_REGIONS.includes(dataResidencyRegion)) throw validationError(`Unsupported data residency region: ${dataResidencyRegion}`);

  return {
    code: input.code || String(input.name).toUpperCase().replace(/[^A-Z0-9]+/g, '-').replace(/^-|-$/g, ''),
    name: input.name,
    description: input.description || '',
    status,
    mfaMode,
    sessionTimeoutMinutes: Number(input.sessionTimeoutMinutes || 480),
    maxConcurrentSessions: Number(input.maxConcurrentSessions || 5),
    allowPasswordLogin: input.allowPasswordLogin !== false,
    requireSso: input.requireSso === true,
    allowedIpRanges: normalizeIpList(input.allowedIpRanges || []),
    blockedIpRanges: normalizeIpList(input.blockedIpRanges || []),
    dataResidencyRegion,
    restrictExports: input.restrictExports === true,
    restrictApiTokens: input.restrictApiTokens === true,
    auditLogRetentionDays: Number(input.auditLogRetentionDays || 365),
    metadata: input.metadata || {}
  };
}

function ipToLong(ip) {
  const parts = String(ip || '').split('.').map(Number);
  if (parts.length !== 4 || parts.some(x => Number.isNaN(x) || x < 0 || x > 255)) return null;
  return (((parts[0] * 256 + parts[1]) * 256 + parts[2]) * 256 + parts[3]) >>> 0;
}

function ipMatchesRange(ip, range) {
  if (!ip || !range) return false;
  const raw = String(range).trim();

  if (raw.includes('/')) {
    const [base, bitsText] = raw.split('/');
    const bits = Number(bitsText);
    const ipLong = ipToLong(ip);
    const baseLong = ipToLong(base);

    if (ipLong === null || baseLong === null || Number.isNaN(bits) || bits < 0 || bits > 32) return false;

    const mask = bits === 0 ? 0 : (0xffffffff << (32 - bits)) >>> 0;
    return (ipLong & mask) === (baseLong & mask);
  }

  return String(ip).trim() === raw;
}

function ipInRanges(ip, ranges = []) {
  return normalizeIpList(ranges).some(range => ipMatchesRange(ip, range));
}

function isAdminRole(roles = []) {
  return (Array.isArray(roles) ? roles : []).some(role => ['owner', 'admin', 'manager'].includes(String(role).toLowerCase()));
}

function evaluateTenantAccess(policy = {}, context = {}) {
  if (!policy || policy.status !== 'active') {
    return {
      result: 'deny',
      reason: 'Tenant security policy is not active',
      challenges: []
    };
  }

  const ip = context.ipAddress || '';
  if (policy.blockedIpRanges && ipInRanges(ip, policy.blockedIpRanges)) {
    return {
      result: 'deny',
      reason: 'IP address is blocked by tenant policy',
      challenges: []
    };
  }

  if (policy.allowedIpRanges && policy.allowedIpRanges.length > 0 && !ipInRanges(ip, policy.allowedIpRanges)) {
    return {
      result: 'deny',
      reason: 'IP address is outside the tenant allowlist',
      challenges: []
    };
  }

  if (policy.requireSso && context.authMethod !== 'sso') {
    return {
      result: 'deny',
      reason: 'Tenant requires SSO authentication',
      challenges: []
    };
  }

  if (policy.allowPasswordLogin === false && context.authMethod === 'password') {
    return {
      result: 'deny',
      reason: 'Password login is disabled for this tenant',
      challenges: []
    };
  }

  const challenges = [];
  const roles = context.roles || [];
  const hasMfa = context.mfaVerified === true;

  if (policy.mfaMode === 'required' && !hasMfa) challenges.push('mfa_required');
  if (policy.mfaMode === 'required_for_admins' && isAdminRole(roles) && !hasMfa) challenges.push('admin_mfa_required');

  if (policy.restrictExports && context.action === 'export') {
    if (!context.exportApproved) challenges.push('export_approval_required');
  }

  if (policy.restrictApiTokens && context.action === 'api_token.create') {
    if (!isAdminRole(roles)) {
      return {
        result: 'deny',
        reason: 'Only administrators can create API tokens under this policy',
        challenges: []
      };
    }
  }

  if (challenges.length > 0) {
    return {
      result: 'challenge',
      reason: 'Additional security challenge required',
      challenges
    };
  }

  return {
    result: 'allow',
    reason: 'Access allowed by tenant security policy',
    challenges: []
  };
}

function buildPolicySummary(policy = {}) {
  const normalized = normalizeTenantSecurityPolicyInput(policy);
  return {
    code: normalized.code,
    name: normalized.name,
    status: normalized.status,
    mfaMode: normalized.mfaMode,
    requireSso: normalized.requireSso,
    allowPasswordLogin: normalized.allowPasswordLogin,
    allowedIpRangeCount: normalized.allowedIpRanges.length,
    blockedIpRangeCount: normalized.blockedIpRanges.length,
    dataResidencyRegion: normalized.dataResidencyRegion,
    restrictExports: normalized.restrictExports,
    restrictApiTokens: normalized.restrictApiTokens,
    auditLogRetentionDays: normalized.auditLogRetentionDays
  };
}

module.exports = {
  POLICY_STATUSES,
  MFA_MODES,
  DECISION_RESULTS,
  DATA_RESIDENCY_REGIONS,
  normalizeIpList,
  normalizeTenantSecurityPolicyInput,
  ipToLong,
  ipMatchesRange,
  ipInRanges,
  isAdminRole,
  evaluateTenantAccess,
  buildPolicySummary
};
