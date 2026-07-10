const { validationError } = require('../errors/domainError');

const RISK_BANDS = ['low', 'moderate', 'high', 'critical'];
const MODEL_STATUSES = ['draft', 'active', 'retired'];
const PREDICTION_STATUSES = ['open', 'converted_to_work_order', 'dismissed', 'resolved'];

const DEFAULT_MODEL_WEIGHTS = {
  age: 20,
  usage: 20,
  faultFrequency: 25,
  recency: 15,
  condition: 15,
  criticality: 5
};

function clamp(value, min = 0, max = 1) {
  const n = Number(value || 0);
  if (n < min) return min;
  if (n > max) return max;
  return n;
}

function daysBetween(startDate, endDate) {
  if (!startDate || !endDate) return null;
  const start = new Date(`${String(startDate).slice(0, 10)}T00:00:00.000Z`);
  const end = new Date(`${String(endDate).slice(0, 10)}T00:00:00.000Z`);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return null;
  return Math.floor((end - start) / 86400000);
}

function normalizePredictiveModelInput(input = {}) {
  if (!input.name) throw validationError('name is required');

  const status = input.status || 'active';
  if (!MODEL_STATUSES.includes(status)) throw validationError(`Unsupported predictive model status: ${status}`);

  return {
    code: input.code || String(input.name).toUpperCase().replace(/[^A-Z0-9]+/g, '-').replace(/^-|-$/g, ''),
    name: input.name,
    description: input.description || '',
    equipmentType: input.equipmentType || '',
    status,
    weights: { ...DEFAULT_MODEL_WEIGHTS, ...(input.weights || {}) },
    riskThresholds: {
      moderate: Number((input.riskThresholds || {}).moderate || 35),
      high: Number((input.riskThresholds || {}).high || 60),
      critical: Number((input.riskThresholds || {}).critical || 80)
    },
    metadata: input.metadata || {}
  };
}

function normalizeAssetRiskInput(input = {}) {
  if (!input.assetId) throw validationError('assetId is required');

  return {
    assetId: input.assetId,
    customerId: input.customerId || '',
    equipmentType: input.equipmentType || '',
    modelNumber: input.modelNumber || '',
    installDate: input.installDate || '',
    lastServiceDate: input.lastServiceDate || '',
    asOfDate: input.asOfDate || new Date().toISOString().slice(0, 10),
    expectedLifeYears: Number(input.expectedLifeYears || 10),
    usageHours: Number(input.usageHours || 0),
    expectedAnnualUsageHours: Number(input.expectedAnnualUsageHours || 2000),
    faultCount90Days: Number(input.faultCount90Days || 0),
    faultCount365Days: Number(input.faultCount365Days || 0),
    conditionScore: Number(input.conditionScore === undefined ? 100 : input.conditionScore),
    criticality: Number(input.criticality || 3),
    symptoms: Array.isArray(input.symptoms) ? input.symptoms : [],
    metadata: input.metadata || {}
  };
}

function scoreAssetRisk(input = {}, model = {}) {
  const asset = normalizeAssetRiskInput(input);
  const weights = { ...DEFAULT_MODEL_WEIGHTS, ...((model || {}).weights || {}) };
  const thresholds = {
    moderate: 35,
    high: 60,
    critical: 80,
    ...((model || {}).riskThresholds || {})
  };

  const ageDays = daysBetween(asset.installDate, asset.asOfDate);
  const expectedLifeDays = Math.max(1, asset.expectedLifeYears * 365);
  const ageFactor = ageDays === null ? 0.25 : clamp(ageDays / expectedLifeDays);

  const usageFactor = clamp(asset.usageHours / Math.max(1, asset.expectedAnnualUsageHours * Math.max(1, asset.expectedLifeYears)));

  const shortFaultFactor = clamp(asset.faultCount90Days / 5);
  const annualFaultFactor = clamp(asset.faultCount365Days / 12);
  const faultFactor = Math.max(shortFaultFactor, annualFaultFactor);

  const daysSinceService = daysBetween(asset.lastServiceDate, asset.asOfDate);
  const recencyFactor = daysSinceService === null ? 0.4 : clamp(daysSinceService / 365);

  const conditionFactor = clamp((100 - asset.conditionScore) / 100);
  const criticalityFactor = clamp(asset.criticality / 5);

  const weighted =
    (ageFactor * Number(weights.age || 0)) +
    (usageFactor * Number(weights.usage || 0)) +
    (faultFactor * Number(weights.faultFrequency || 0)) +
    (recencyFactor * Number(weights.recency || 0)) +
    (conditionFactor * Number(weights.condition || 0)) +
    (criticalityFactor * Number(weights.criticality || 0));

  const totalWeight = Object.values(weights).reduce((sum, value) => sum + Number(value || 0), 0) || 1;
  const riskScore = Math.round((weighted / totalWeight) * 10000) / 100;

  let riskBand = 'low';
  if (riskScore >= thresholds.critical) riskBand = 'critical';
  else if (riskScore >= thresholds.high) riskBand = 'high';
  else if (riskScore >= thresholds.moderate) riskBand = 'moderate';

  const drivers = [];
  if (ageFactor >= 0.7) drivers.push('Asset is late in expected service life');
  if (usageFactor >= 0.7) drivers.push('Usage is high relative to expected life');
  if (faultFactor >= 0.5) drivers.push('Recent fault frequency is elevated');
  if (recencyFactor >= 0.75) drivers.push('Maintenance interval is overdue');
  if (conditionFactor >= 0.4) drivers.push('Condition score is degraded');
  if (criticalityFactor >= 0.8) drivers.push('Asset is business-critical');

  return {
    assetId: asset.assetId,
    customerId: asset.customerId,
    equipmentType: asset.equipmentType,
    riskScore,
    riskBand,
    failureProbabilityPercent: Math.min(95, Math.round((riskScore * 0.9 + faultFactor * 10) * 100) / 100),
    drivers,
    factors: {
      ageFactor,
      usageFactor,
      faultFactor,
      recencyFactor,
      conditionFactor,
      criticalityFactor
    },
    modelCode: model.code || '',
    asOfDate: asset.asOfDate
  };
}

function recommendMaintenanceActions(prediction = {}) {
  const band = prediction.riskBand || 'low';
  if (band === 'critical') {
    return [
      { action: 'Create urgent inspection work order', priority: 'urgent', dueDays: 1 },
      { action: 'Notify service manager', priority: 'urgent', dueDays: 0 },
      { action: 'Review replacement quote option', priority: 'high', dueDays: 3 }
    ];
  }
  if (band === 'high') {
    return [
      { action: 'Schedule preventive maintenance visit', priority: 'high', dueDays: 7 },
      { action: 'Prepare likely replacement parts', priority: 'normal', dueDays: 7 }
    ];
  }
  if (band === 'moderate') {
    return [
      { action: 'Add asset to preventive maintenance watchlist', priority: 'normal', dueDays: 30 },
      { action: 'Review next scheduled maintenance interval', priority: 'normal', dueDays: 30 }
    ];
  }
  return [
    { action: 'Continue normal monitoring', priority: 'low', dueDays: 90 }
  ];
}

function normalizePredictionSnapshotInput(input = {}) {
  if (!input.assetId) throw validationError('assetId is required');
  const status = input.status || 'open';
  if (!PREDICTION_STATUSES.includes(status)) throw validationError(`Unsupported prediction status: ${status}`);

  const riskBand = input.riskBand || 'low';
  if (!RISK_BANDS.includes(riskBand)) throw validationError(`Unsupported risk band: ${riskBand}`);

  return {
    modelId: input.modelId || '',
    assetId: input.assetId,
    customerId: input.customerId || '',
    equipmentType: input.equipmentType || '',
    riskScore: Number(input.riskScore || 0),
    riskBand,
    failureProbabilityPercent: Number(input.failureProbabilityPercent || 0),
    drivers: Array.isArray(input.drivers) ? input.drivers : [],
    factors: input.factors || {},
    recommendedActions: Array.isArray(input.recommendedActions) ? input.recommendedActions : [],
    status,
    generatedAt: input.generatedAt || new Date().toISOString(),
    convertedJobId: input.convertedJobId || '',
    dismissedReason: input.dismissedReason || '',
    metadata: input.metadata || {}
  };
}

module.exports = {
  RISK_BANDS,
  MODEL_STATUSES,
  PREDICTION_STATUSES,
  DEFAULT_MODEL_WEIGHTS,
  clamp,
  daysBetween,
  normalizePredictiveModelInput,
  normalizeAssetRiskInput,
  scoreAssetRisk,
  recommendMaintenanceActions,
  normalizePredictionSnapshotInput
};
