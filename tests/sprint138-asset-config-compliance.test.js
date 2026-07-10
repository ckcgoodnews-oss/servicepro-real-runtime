const fs = require('fs');

const required = [
  'apps/api/src/services/assetConfigComplianceService.js',
  'apps/api/src/repositories/assetConfigComplianceRepository.js',
  'apps/api/src/routes/assetConfigCompliance.js',
  'scripts/seed-asset-config-compliance.js',
  'packages/database/postgres/138_asset_config_compliance.sql',
  'docs/sprint138-asset-config-compliance.md'
];

for (const file of required) {
  if (!fs.existsSync(file)) {
    console.error(`Missing required Sprint 138 patch file: ${file}`);
    process.exit(1);
  }
}

const {
  normalizeAssetInput,
  normalizeBaselineInput,
  normalizeRuleInput,
  normalizeScanInput,
  normalizeFindingInput,
  normalizeRemediationInput,
  readKey,
  compareValue,
  evaluateRule,
  activateAsset,
  quarantineAsset,
  activateBaseline,
  startScan,
  completeScan,
  failScan,
  resolveFinding,
  acceptFindingRisk,
  completeRemediation,
  waiveRemediation,
  complianceMetrics
} = require('../apps/api/src/services/assetConfigComplianceService');

let asset = normalizeAssetInput({
  tenantId: 'tenant_demo',
  name: 'prod-api-01',
  assetType: 'server',
  configuration: { ssh: { passwordAuth: 'yes' }, disk: { encryption: 'disabled' } }
});
if (asset.assetTag !== 'PROD-API-01') process.exit(1);
asset = activateAsset(asset);
if (asset.status !== 'active') process.exit(1);
if (quarantineAsset(asset).status !== 'quarantined') process.exit(1);

let baseline = normalizeBaselineInput({ tenantId: 'tenant_demo', name: 'Server Baseline', assetType: 'server' });
baseline = activateBaseline(baseline);
if (baseline.status !== 'active') process.exit(1);

const rule = normalizeRuleInput({ baselineId: 'base1', key: 'ssh.passwordAuth', operator: 'eq', expectedValue: 'no', severity: 'high' });
if (readKey(asset.configuration, 'ssh.passwordAuth') !== 'yes') process.exit(1);
if (!compareValue('5', 'gte', '3')) process.exit(1);
const evaluation = evaluateRule(asset, rule);
if (evaluation.compliant) process.exit(1);

let scan = normalizeScanInput({ tenantId: 'tenant_demo' });
scan = startScan(scan);
scan = completeScan(scan, 1, 1);
if (scan.status !== 'completed') process.exit(1);
if (failScan(normalizeScanInput({ tenantId: 'tenant_demo' }), 'bad').status !== 'failed') process.exit(1);

let finding = normalizeFindingInput({ assetId: 'asset1', ruleId: 'rule1', severity: 'critical' });
finding = acceptFindingRisk(finding, 'temporary exception');
if (finding.status !== 'accepted_risk') process.exit(1);
finding = resolveFinding({ ...finding, status: 'open' });
if (finding.status !== 'resolved') process.exit(1);

let remediation = normalizeRemediationInput({ findingId: 'finding1', title: 'Disable password auth' });
remediation = completeRemediation(remediation);
if (remediation.status !== 'completed') process.exit(1);
if (waiveRemediation({ ...remediation, status: 'open' }, 'accepted risk').status !== 'waived') process.exit(1);

const metrics = complianceMetrics({
  assets: [asset],
  baselines: [baseline],
  scans: [scan],
  findings: [{ ...finding, status: 'open', severity: 'critical' }],
  remediations: [{ ...remediation, status: 'open' }]
});
if (metrics.activeAssets !== 1 || metrics.activeBaselines !== 1 || metrics.criticalFindings !== 1 || metrics.openRemediations !== 1) process.exit(1);

console.log('Sprint 138 asset config compliance patch test passed.');
