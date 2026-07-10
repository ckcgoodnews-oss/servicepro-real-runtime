const { validationError } = require('../errors/domainError');

function normalizeWarehouseInput(input = {}) {
  if (!input.name) throw validationError('name is required');
  return {
    code: input.code || String(input.name).toUpperCase().replace(/[^A-Z0-9]+/g, '-').replace(/^-|-$/g, ''),
    name: input.name,
    description: input.description || '',
    warehouseType: input.warehouseType || 'main',
    address1: input.address1 || '',
    address2: input.address2 || '',
    city: input.city || '',
    state: input.state || '',
    postalCode: input.postalCode || '',
    country: input.country || 'US',
    active: input.active !== false,
    notes: input.notes || ''
  };
}

function normalizeBinInput(input = {}) {
  if (!input.warehouseId) throw validationError('warehouseId is required');
  if (!input.code) throw validationError('code is required');
  return {
    warehouseId: input.warehouseId,
    code: input.code,
    name: input.name || input.code,
    description: input.description || '',
    active: input.active !== false,
    sortOrder: Number(input.sortOrder || 0)
  };
}

function normalizeTransferLine(input = {}) {
  if (!input.inventoryItemId && !input.sku) throw validationError('inventoryItemId or sku is required');
  const quantity = Number(input.quantity || 0);
  if (quantity <= 0) throw validationError('transfer line quantity must be greater than zero');
  return {
    inventoryItemId: input.inventoryItemId || '',
    sku: input.sku || '',
    description: input.description || '',
    quantity,
    unitCost: Number(input.unitCost || 0),
    notes: input.notes || ''
  };
}

function normalizeTransferInput(input = {}) {
  if (!input.fromWarehouseId) throw validationError('fromWarehouseId is required');
  if (!input.toWarehouseId) throw validationError('toWarehouseId is required');
  if (input.fromWarehouseId === input.toWarehouseId && (input.fromBinId || '') === (input.toBinId || '')) {
    throw validationError('transfer source and destination cannot be the same');
  }
  const lines = Array.isArray(input.lines) ? input.lines.map(normalizeTransferLine) : [];
  if (!lines.length) throw validationError('at least one transfer line is required');
  return {
    fromWarehouseId: input.fromWarehouseId,
    fromBinId: input.fromBinId || '',
    toWarehouseId: input.toWarehouseId,
    toBinId: input.toBinId || '',
    status: input.status || 'draft',
    transferDate: input.transferDate || new Date().toISOString().slice(0, 10),
    completedDate: input.completedDate || '',
    reference: input.reference || '',
    notes: input.notes || '',
    lines
  };
}

function transferLineTotalQuantity(lines = []) {
  return lines.reduce((sum, line) => sum + Number(line.quantity || 0), 0);
}

module.exports = {
  normalizeWarehouseInput,
  normalizeBinInput,
  normalizeTransferLine,
  normalizeTransferInput,
  transferLineTotalQuantity
};
