const { validationError } = require('../errors/domainError');

const ASSET_STATUSES = ['discovered', 'active', 'quarantined', 'retired', 'archived'];
const ASSET_TYPES = ['server', 'workstation', 'database', 'application', 'network_device', 'cloud_resource', 'container', 'other'];
const CRITICALITY_LEVELS = ['low', 'medium', 'high', 'critical'];
const BASELINE_STATUSES = ['draft', 'active', 'retired'];
const RULE_SEVERITIES = ['low', 'medium', 'high', 'critical'];
const SCAN_STATUSES = ['queued', 'running', 'completed', 'failed', 'cancelled'];
const FINDING_STATUSES = ['open', 'in_progress', 'resolved', 'accepted_risk', 'false_positive'];
const REMEDIATION_STATUSES = ['open', 'in_progress', 'completed', 'waived', 'cancelled'];
const OPERATORS = ['eq', 'neq', 'contains', 'not_contains', 'gte', 'lte', 'exists'];

function slugCode(value = '') {
  return String(value).toUpperCase().replace(/[^A-Z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function assertAllowed(value, allowed, label) {
  if (!allowed.includes(value)) throw validationError(`Unsupported ${label}: ${value}`);
}

function normalizeAssetInput(input = {}) {
  if (!input.tenantId) throw validationError('tenantId is required');
  if (!input.name) throw validationError('name is required');
  const status = input.status || 'discovered';
  const assetType = input.assetType || 'other';
  const criticality = input.criticality || 'medium';
  assertAllowed(status, ASSET_STATUSES, 'asset status');
  assertAllowed(assetType, ASSET_TYPES, 'asset type');
  assertAllowed(criticality, CRITICALITY_LEVELS, 'asset criticality');
  return {
    tenantId: input.tenantId,
    assetTag: input.assetTag || slugCode(input.name),
    name: input.name,
    description: input.description || '',
    status,
    assetType,
    criticality,
    owner: input.owner || '',
    businessUnit: input.businessUnit || '',
    environment: input.environment || 'prod',
    hostname: input.hostname || '',
    ipAddress: input.ipAddress || '',
    region: input.region || '',
    tags: Array.isArray(input.tags) ? input.tags : [],
    configuration: input.configuration || {},
    discoveredAt: input.discoveredAt || new Date().toISOString(),
    lastSeenAt: input.lastSeenAt || new Date().toISOString(),
    metadata: input.metadata || {}
  };
}

function normalizeBaselineInput(input = {}) {
  if (!input.tenantId) throw validationError('tenantId is required');
  if (!input.name) throw validationError('name is required');
  const status = input.status || 'draft';
  assertAllowed(status, BASELINE_STATUSES, 'baseline status');
  return {
    tenantId: input.tenantId,
    code: input.code || slugCode(input.name),
    name: input.name,
    description: input.description || '',
    status,
    assetType: input.assetType || '',
    environment: input.environment || '',
    owner: input.owner || '',
    version: input.version || '1.0',
    metadata: input.metadata || {}
  };
}

function normalizeRuleInput(input = {}) {
  if (!input.baselineId) throw validationError('baselineId is required');
  if (!input.key) throw validationError('key is required');
  const operator = input.operator || 'eq';
  const severity = input.severity || 'medium';
  assertAllowed(operator, OPERATORS, 'rule operator');
  assertAllowed(severity, RULE_SEVERITIES, 'rule severity');
  return {
    baselineId: input.baselineId,
    tenantId: input.tenantId || '',
    key: input.key,
    operator,
    expectedValue: input.expectedValue === undefined ? '' : input.expectedValue,
    severity,
    description: input.description || '',
    remediationHint: input.remediationHint || '',
    enabled: input.enabled !== false,
    metadata: input.metadata || {}
  };
}

function normalizeScanInput(input = {}) {
  if (!input.tenantId) throw validationError('tenantId is required');
  const status = input.status || 'queued';
  assertAllowed(status, SCAN_STATUSES, 'scan status');
  return {
    tenantId: input.tenantId,
    baselineId: input.baselineId || '',
    assetId: input.assetId || '',
    status,
    requestedBy: input.requestedBy || '',
    requestedAt: input.requestedAt || new Date().toISOString(),
    startedAt: input.startedAt || '',
    completedAt: input.completedAt || '',
    assetsScanned: Number(input.assetsScanned || 0),
    findingsCreated: Number(input.findingsCreated || 0),
    errorMessage: input.errorMessage || '',
    metadata: input.metadata || {}
  };
}

function normalizeFindingInput(input = {}) {
  if (!input.assetId) throw validationError('assetId is required');
  if (!input.ruleId) throw validationError('ruleId is required');
  const status = input.status || 'open';
  const severity = input.severity || 'medium';
  assertAllowed(status, FINDING_STATUSES, 'finding status');
  assertAllowed(severity, RULE_SEVERITIES, 'finding severity');
  return {
    assetId: input.assetId,
    baselineId: input.baselineId || '',
    ruleId: input.ruleId,
    scanId: input.scanId || '',
    tenantId: input.tenantId || '',
    status,
    severity,
    key: input.key || '',
    expectedValue: input.expectedValue === undefined ? '' : input.expectedValue,
    actualValue: input.actualValue === undefined ? '' : input.actualValue,
    detectedAt: input.detectedAt || new Date().toISOString(),
    resolvedAt: input.resolvedAt || '',
    acceptedReason: input.acceptedReason || '',
    metadata: input.metadata || {}
  };
}

function normalizeRemediationInput(input = {}) {
  if (!input.findingId) throw validationError('findingId is required');
  if (!input.title) throw validationError('title is required');
  const status = input.status || 'open';
  assertAllowed(status, REMEDIATION_STATUSES, 'remediation status');
  return {
    findingId: input.findingId,
    assetId: input.assetId || '',
    tenantId: input.tenantId || '',
    title: input.title,
    description: input.description || '',
    status,
    owner: input.owner || '',
    dueAt: input.dueAt || '',
    completedAt: input.completedAt || '',
    waiverReason: input.waiverReason || '',
    metadata: input.metadata || {}
  };
}

function readKey(configuration = {}, key = '') {
  return String(key).split('.').filter(Boolean).reduce((acc, part) => {
    if (acc && Object.prototype.hasOwnProperty.call(acc, part)) return acc[part];
    return undefined;
  }, configuration);
}

function compareValue(actual, operator, expected) {
  if (operator === 'exists') return actual !== undefined && actual !== null && actual !== '';
  if (operator === 'eq') return String(actual) === String(expected);
  if (operator === 'neq') return String(actual) !== String(expected);
  if (operator === 'contains') return String(actual || '').includes(String(expected));
  if (operator === 'not_contains') return !String(actual || '').includes(String(expected));
  if (operator === 'gte') return Number(actual) >= Number(expected);
  if (operator === 'lte') return Number(actual) <= Number(expected);
  throw validationError(`Unsupported operator: ${operator}`);
}

function evaluateRule(asset, rule) {
  const actual = readKey(asset.configuration || {}, rule.key);
  const compliant = compareValue(actual, rule.operator, rule.expectedValue);
  return { compliant, actualValue: actual === undefined ? '' : actual, expectedValue: rule.expectedValue };
}

function activateAsset(asset, at = new Date().toISOString()) { return { ...asset, status: 'active', lastSeenAt: at, updatedAt: at }; }
function quarantineAsset(asset, at = new Date().toISOString()) { return { ...asset, status: 'quarantined', updatedAt: at }; }
function activateBaseline(baseline, at = new Date().toISOString()) { return { ...baseline, status: 'active', updatedAt: at }; }
function startScan(scan, at = new Date().toISOString()) { return { ...scan, status: 'running', startedAt: at, updatedAt: at }; }
function completeScan(scan, assetsScanned = 0, findingsCreated = 0, at = new Date().toISOString()) {
  return { ...scan, status: 'completed', assetsScanned: Number(assetsScanned || 0), findingsCreated: Number(findingsCreated || 0), completedAt: at, updatedAt: at };
}
function failScan(scan, errorMessage = '', at = new Date().toISOString()) {
  return { ...scan, status: 'failed', errorMessage: errorMessage || 'Scan failed', completedAt: at, updatedAt: at };
}
function resolveFinding(finding, at = new Date().toISOString()) { return { ...finding, status: 'resolved', resolvedAt: at, updatedAt: at }; }
function acceptFindingRisk(finding, reason, at = new Date().toISOString()) {
  if (!reason) throw validationError('reason is required');
  return { ...finding, status: 'accepted_risk', acceptedReason: reason, updatedAt: at };
}
function completeRemediation(remediation, at = new Date().toISOString()) { return { ...remediation, status: 'completed', completedAt: at, updatedAt: at }; }
function waiveRemediation(remediation, reason, at = new Date().toISOString()) {
  if (!reason) throw validationError('reason is required');
  return { ...remediation, status: 'waived', waiverReason: reason, updatedAt: at };
}

function complianceMetrics({ assets = [], baselines = [], scans = [], findings = [], remediations = [] }) {
  return {
    activeAssets: assets.filter(x => x.status === 'active').length,
    quarantinedAssets: assets.filter(x => x.status === 'quarantined').length,
    activeBaselines: baselines.filter(x => x.status === 'active').length,
    completedScans: scans.filter(x => x.status === 'completed').length,
    openFindings: findings.filter(x => ['open', 'in_progress'].includes(x.status)).length,
    criticalFindings: findings.filter(x => x.severity === 'critical' && ['open', 'in_progress'].includes(x.status)).length,
    openRemediations: remediations.filter(x => ['open', 'in_progress'].includes(x.status)).length
  };
}

module.exports = {
  ASSET_STATUSES, ASSET_TYPES, CRITICALITY_LEVELS, BASELINE_STATUSES, RULE_SEVERITIES,
  SCAN_STATUSES, FINDING_STATUSES, REMEDIATION_STATUSES, OPERATORS, slugCode,
  normalizeAssetInput, normalizeBaselineInput, normalizeRuleInput, normalizeScanInput,
  normalizeFindingInput, normalizeRemediationInput, readKey, compareValue, evaluateRule,
  activateAsset, quarantineAsset, activateBaseline, startScan, completeScan, failScan,
  resolveFinding, acceptFindingRisk, completeRemediation, waiveRemediation, complianceMetrics
};
