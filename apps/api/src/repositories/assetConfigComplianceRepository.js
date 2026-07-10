const { makeId, now } = require('../services/id');
const svc = require('../services/assetConfigComplianceService');

function createAssetConfigComplianceRepository(store) {
  if (store.type === 'json') return createJsonAssetConfigComplianceRepository(store);
  if (store.type === 'postgres') return createPostgresAssetConfigComplianceRepository();
  throw new Error(`Unsupported store type: ${store.type}`);
}

function ensureAssetConfig(data) {
  data.configAssets ||= [];
  data.configBaselines ||= [];
  data.configBaselineRules ||= [];
  data.configScans ||= [];
  data.configFindings ||= [];
  data.configRemediations ||= [];
  return data;
}

function createJsonAssetConfigComplianceRepository(store) {
  return {
    listAssets(filters = {}) {
      return ensureAssetConfig(store.read()).configAssets
        .filter(x => !filters.tenantId || x.tenantId === filters.tenantId)
        .filter(x => !filters.status || x.status === filters.status)
        .filter(x => !filters.assetType || x.assetType === filters.assetType)
        .filter(x => !filters.criticality || x.criticality === filters.criticality)
        .sort((a, b) => String(a.name).localeCompare(String(b.name)));
    },
    createAsset(input) {
      const data = ensureAssetConfig(store.read());
      const row = { id: makeId('asset'), ...svc.normalizeAssetInput(input), createdAt: now(), updatedAt: now() };
      data.configAssets.push(row); store.write(data); return row;
    },
    activateAsset(id) {
      const data = ensureAssetConfig(store.read());
      const idx = data.configAssets.findIndex(x => x.id === id);
      if (idx === -1) return null;
      data.configAssets[idx] = svc.activateAsset(data.configAssets[idx]); store.write(data); return data.configAssets[idx];
    },
    quarantineAsset(id) {
      const data = ensureAssetConfig(store.read());
      const idx = data.configAssets.findIndex(x => x.id === id);
      if (idx === -1) return null;
      data.configAssets[idx] = svc.quarantineAsset(data.configAssets[idx]); store.write(data); return data.configAssets[idx];
    },
    createBaseline(input) {
      const data = ensureAssetConfig(store.read());
      const row = { id: makeId('base'), ...svc.normalizeBaselineInput(input), createdAt: now(), updatedAt: now() };
      data.configBaselines.push(row); store.write(data); return row;
    },
    activateBaseline(id) {
      const data = ensureAssetConfig(store.read());
      const idx = data.configBaselines.findIndex(x => x.id === id);
      if (idx === -1) return null;
      data.configBaselines[idx] = svc.activateBaseline(data.configBaselines[idx]); store.write(data); return data.configBaselines[idx];
    },
    createRule(input) {
      const data = ensureAssetConfig(store.read());
      const row = { id: makeId('rule'), ...svc.normalizeRuleInput(input), createdAt: now(), updatedAt: now() };
      data.configBaselineRules.push(row); store.write(data); return row;
    },
    listRules(baselineId) {
      return ensureAssetConfig(store.read()).configBaselineRules.filter(x => x.baselineId === baselineId && x.enabled !== false);
    },
    createScan(input) {
      const data = ensureAssetConfig(store.read());
      const row = { id: makeId('scan'), ...svc.normalizeScanInput(input), createdAt: now(), updatedAt: now() };
      data.configScans.push(row); store.write(data); return row;
    },
    startScan(id) {
      const data = ensureAssetConfig(store.read());
      const idx = data.configScans.findIndex(x => x.id === id);
      if (idx === -1) return null;
      data.configScans[idx] = svc.startScan(data.configScans[idx]); store.write(data); return data.configScans[idx];
    },
    runScan(id) {
      const data = ensureAssetConfig(store.read());
      const idx = data.configScans.findIndex(x => x.id === id);
      if (idx === -1) return null;
      const scan = data.configScans[idx];
      const baselines = scan.baselineId ? data.configBaselines.filter(x => x.id === scan.baselineId) : data.configBaselines.filter(x => x.status === 'active');
      const assets = scan.assetId ? data.configAssets.filter(x => x.id === scan.assetId) : data.configAssets.filter(x => x.status === 'active');
      let findingsCreated = 0;
      for (const baseline of baselines) {
        const rules = data.configBaselineRules.filter(x => x.baselineId === baseline.id && x.enabled !== false);
        for (const asset of assets.filter(a => !baseline.assetType || a.assetType === baseline.assetType)) {
          for (const rule of rules) {
            const result = svc.evaluateRule(asset, rule);
            if (!result.compliant) {
              data.configFindings.push({
                id: makeId('finding'),
                ...svc.normalizeFindingInput({
                  assetId: asset.id, baselineId: baseline.id, ruleId: rule.id, scanId: scan.id,
                  tenantId: asset.tenantId, severity: rule.severity, key: rule.key,
                  expectedValue: rule.expectedValue, actualValue: result.actualValue
                }),
                createdAt: now(), updatedAt: now()
              });
              findingsCreated++;
            }
          }
        }
      }
      data.configScans[idx] = svc.completeScan(data.configScans[idx], assets.length, findingsCreated);
      store.write(data); return data.configScans[idx];
    },
    listFindings(filters = {}) {
      return ensureAssetConfig(store.read()).configFindings
        .filter(x => !filters.tenantId || x.tenantId === filters.tenantId)
        .filter(x => !filters.assetId || x.assetId === filters.assetId)
        .filter(x => !filters.status || x.status === filters.status)
        .filter(x => !filters.severity || x.severity === filters.severity)
        .sort((a, b) => String(b.detectedAt).localeCompare(String(a.detectedAt)));
    },
    resolveFinding(id) {
      const data = ensureAssetConfig(store.read());
      const idx = data.configFindings.findIndex(x => x.id === id);
      if (idx === -1) return null;
      data.configFindings[idx] = svc.resolveFinding(data.configFindings[idx]); store.write(data); return data.configFindings[idx];
    },
    acceptFindingRisk(id, reason) {
      const data = ensureAssetConfig(store.read());
      const idx = data.configFindings.findIndex(x => x.id === id);
      if (idx === -1) return null;
      data.configFindings[idx] = svc.acceptFindingRisk(data.configFindings[idx], reason); store.write(data); return data.configFindings[idx];
    },
    createRemediation(input) {
      const data = ensureAssetConfig(store.read());
      const row = { id: makeId('crem'), ...svc.normalizeRemediationInput(input), createdAt: now(), updatedAt: now() };
      data.configRemediations.push(row); store.write(data); return row;
    },
    completeRemediation(id) {
      const data = ensureAssetConfig(store.read());
      const idx = data.configRemediations.findIndex(x => x.id === id);
      if (idx === -1) return null;
      data.configRemediations[idx] = svc.completeRemediation(data.configRemediations[idx]);
      const fidx = data.configFindings.findIndex(x => x.id === data.configRemediations[idx].findingId);
      if (fidx !== -1) data.configFindings[fidx] = svc.resolveFinding(data.configFindings[fidx]);
      store.write(data); return data.configRemediations[idx];
    },
    metrics(tenantId) {
      const data = ensureAssetConfig(store.read());
      return svc.complianceMetrics({
        assets: data.configAssets.filter(x => !tenantId || x.tenantId === tenantId),
        baselines: data.configBaselines.filter(x => !tenantId || x.tenantId === tenantId),
        scans: data.configScans.filter(x => !tenantId || x.tenantId === tenantId),
        findings: data.configFindings.filter(x => !tenantId || x.tenantId === tenantId),
        remediations: data.configRemediations.filter(x => !tenantId || x.tenantId === tenantId)
      });
    }
  };
}

function createPostgresAssetConfigComplianceRepository() {
  return {
    async listAssets() { return []; },
    async createAsset(input) { return { id: 'postgres-asset-placeholder', ...svc.normalizeAssetInput(input) }; },
    async activateAsset() { return null; },
    async quarantineAsset() { return null; },
    async createBaseline(input) { return { id: 'postgres-baseline-placeholder', ...svc.normalizeBaselineInput(input) }; },
    async activateBaseline() { return null; },
    async createRule(input) { return { id: 'postgres-rule-placeholder', ...svc.normalizeRuleInput(input) }; },
    async listRules() { return []; },
    async createScan(input) { return { id: 'postgres-scan-placeholder', ...svc.normalizeScanInput(input) }; },
    async startScan() { return null; },
    async runScan() { return null; },
    async listFindings() { return []; },
    async resolveFinding() { return null; },
    async acceptFindingRisk() { return null; },
    async createRemediation(input) { return { id: 'postgres-remediation-placeholder', ...svc.normalizeRemediationInput(input) }; },
    async completeRemediation() { return null; },
    async metrics() { return svc.complianceMetrics({}); }
  };
}

module.exports = { createAssetConfigComplianceRepository };
