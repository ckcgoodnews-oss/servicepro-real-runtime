const { validationError } = require('../errors/domainError');

function normalizeCategoryInput(input = {}) {
  if (!input.name) throw validationError('name is required');
  return {
    code: input.code || String(input.name).toUpperCase().replace(/[^A-Z0-9]+/g, '-').replace(/^-|-$/g, ''),
    name: input.name,
    description: input.description || '',
    sortOrder: Number(input.sortOrder || 0),
    active: input.active !== false
  };
}

function normalizeItemInput(input = {}) {
  if (!input.categoryId && !input.categoryCode) throw validationError('categoryId or categoryCode is required');
  if (!input.code) throw validationError('code is required');
  if (!input.name) throw validationError('name is required');

  const basePrice = Number(input.basePrice || 0);
  const laborHours = Number(input.laborHours || 0);
  const materialCost = Number(input.materialCost || 0);
  const unitCost = Number(input.unitCost || materialCost || 0);

  if (basePrice < 0) throw validationError('basePrice cannot be negative');
  if (laborHours < 0) throw validationError('laborHours cannot be negative');
  if (materialCost < 0) throw validationError('materialCost cannot be negative');

  return {
    categoryId: input.categoryId || '',
    categoryCode: input.categoryCode || '',
    code: input.code,
    name: input.name,
    description: input.description || '',
    unit: input.unit || 'each',
    basePrice,
    laborHours,
    materialCost,
    unitCost,
    taxable: input.taxable !== false,
    active: input.active !== false,
    tags: Array.isArray(input.tags) ? input.tags : [],
    version: Number(input.version || 1)
  };
}

function calculateGrossMargin(priceBookItem) {
  const price = Number(priceBookItem.basePrice || 0);
  const cost = Number(priceBookItem.unitCost || priceBookItem.materialCost || 0);
  if (price <= 0) return 0;
  return Math.round(((price - cost) / price) * 10000) / 100;
}

function priceBookLineFromItem(item, quantity = 1) {
  const qty = Number(quantity || 1);
  return {
    code: item.code,
    name: item.name,
    description: item.description || '',
    quantity: qty,
    unitPrice: Number(item.basePrice || 0),
    unitCost: Number(item.unitCost || item.materialCost || 0),
    taxable: item.taxable !== false,
    lineSubtotal: Math.round(qty * Number(item.basePrice || 0) * 100) / 100,
    lineCost: Math.round(qty * Number(item.unitCost || item.materialCost || 0) * 100) / 100,
    source: 'pricebook',
    sourceId: item.id || ''
  };
}

function resolveServiceLines(lines = [], services = []) {
  return lines.map(line => {
    if (!line.serviceCode) return { ...line };
    const service = services.find(item => item.code === line.serviceCode);
    if (!service) throw validationError(`Unknown serviceCode: ${line.serviceCode}`);
    return priceBookLineFromItem(service, line.quantity);
  });
}

async function resolveServiceLinesAsync(tenantId, lines = [], serviceRepository) {
  const services = await Promise.resolve(serviceRepository.list(tenantId));
  return resolveServiceLines(lines, services);
}

module.exports = { normalizeCategoryInput, normalizeItemInput, calculateGrossMargin, priceBookLineFromItem, resolveServiceLines, resolveServiceLinesAsync };
