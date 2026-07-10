const { validationError } = require('../errors/domainError');

function normalizeAssetInput(input = {}) {
  if (!input.customerId) throw validationError('customerId is required');
  if (!input.assetType) throw validationError('assetType is required');
  if (!input.name) throw validationError('name is required');

  return {
    customerId: input.customerId,
    jobId: input.jobId || '',
    assetType: input.assetType,
    name: input.name,
    manufacturer: input.manufacturer || '',
    model: input.model || '',
    serialNumber: input.serialNumber || '',
    installedDate: input.installedDate || '',
    warrantyExpiresAt: input.warrantyExpiresAt || '',
    location: input.location || '',
    status: input.status || 'active',
    notes: input.notes || '',
    metadata: input.metadata || {}
  };
}

function isWarrantyActive(asset, today = new Date().toISOString().slice(0, 10)) {
  return Boolean(asset.warrantyExpiresAt && asset.warrantyExpiresAt >= today);
}

function assetAgeYears(asset, today = new Date().toISOString().slice(0, 10)) {
  if (!asset.installedDate) return null;
  const start = new Date(`${asset.installedDate}T00:00:00.000Z`);
  const end = new Date(`${today}T00:00:00.000Z`);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return null;
  return Math.max(0, Math.round(((end - start) / (365.25 * 24 * 60 * 60 * 1000)) * 10) / 10);
}

function normalizeAssetServiceEvent(input = {}) {
  if (!input.assetId) throw validationError('assetId is required');
  return {
    assetId: input.assetId,
    jobId: input.jobId || '',
    serviceDate: input.serviceDate || new Date().toISOString().slice(0, 10),
    eventType: input.eventType || 'service',
    summary: input.summary || '',
    technicianId: input.technicianId || '',
    notes: input.notes || '',
    metadata: input.metadata || {}
  };
}

module.exports = { normalizeAssetInput, isWarrantyActive, assetAgeYears, normalizeAssetServiceEvent };
