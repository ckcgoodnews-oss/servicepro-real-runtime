const fs = require('fs');

const required = [
  'apps/api/src/services/predictiveMaintenanceService.js',
  'apps/api/src/repositories/predictiveMaintenanceRepository.js',
  'apps/api/src/routes/predictiveMaintenance.js',
  'scripts/seed-predictive-maintenance.js',
  'packages/database/postgres/095_predictive_maintenance_runtime.sql',
  'docs/sprint95-predictive-maintenance-runtime.md'
];

for (const file of required) {
  if (!fs.existsSync(file)) {
    console.error(`Missing required Sprint 95 patch file: ${file}`);
    process.exit(1);
  }
}

const {
  daysBetween,
  normalizePredictiveModelInput,
  normalizeAssetRiskInput,
  scoreAssetRisk,
  recommendMaintenanceActions,
  normalizePredictionSnapshotInput
} = require('../apps/api/src/services/predictiveMaintenanceService');

if (daysBetween('2026-07-01', '2026-07-06') !== 5) {
  console.error('daysBetween failed.');
  process.exit(1);
}

const model = normalizePredictiveModelInput({
  name: 'HVAC Model',
  equipmentType: 'hvac',
  riskThresholds: { moderate: 30, high: 55, critical: 75 }
});

if (model.status !== 'active' || model.weights.age !== 20) {
  console.error('Predictive model normalization failed.');
  process.exit(1);
}

const asset = normalizeAssetRiskInput({
  assetId: 'asset1',
  customerId: 'cust1',
  equipmentType: 'hvac',
  installDate: '2014-07-06',
  lastServiceDate: '2024-01-01',
  asOfDate: '2026-07-06',
  expectedLifeYears: 12,
  usageHours: 22000,
  expectedAnnualUsageHours: 1800,
  faultCount90Days: 4,
  faultCount365Days: 9,
  conditionScore: 45,
  criticality: 5
});

const prediction = scoreAssetRisk(asset, model);
if (!['high', 'critical'].includes(prediction.riskBand) || prediction.riskScore <= 55) {
  console.error('Asset risk scoring failed.');
  process.exit(1);
}

const actions = recommendMaintenanceActions(prediction);
if (!actions.length || !actions[0].action) {
  console.error('Maintenance action recommendation failed.');
  process.exit(1);
}

const snapshot = normalizePredictionSnapshotInput({
  ...prediction,
  recommendedActions: actions
});
if (snapshot.status !== 'open' || snapshot.recommendedActions.length === 0) {
  console.error('Prediction snapshot normalization failed.');
  process.exit(1);
}

console.log('Sprint 95 predictive maintenance runtime patch test passed.');
