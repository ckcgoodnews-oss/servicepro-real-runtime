const { validationError } = require('../errors/domainError');

function normalizeVendorInput(input = {}) {
  if (!input.name) throw validationError('name is required');
  return {
    name: input.name,
    accountNumber: input.accountNumber || '',
    contactName: input.contactName || '',
    email: input.email || '',
    phone: input.phone || '',
    website: input.website || '',
    address1: input.address1 || '',
    address2: input.address2 || '',
    city: input.city || '',
    state: input.state || '',
    postalCode: input.postalCode || '',
    country: input.country || 'US',
    paymentTerms: input.paymentTerms || 'Net 30',
    active: input.active !== false,
    notes: input.notes || ''
  };
}

function normalizePurchaseOrderLine(input = {}) {
  if (!input.description) throw validationError('line description is required');
  const quantity = Number(input.quantity || 1);
  const unitCost = Number(input.unitCost || 0);
  if (quantity <= 0) throw validationError('line quantity must be greater than zero');
  if (unitCost < 0) throw validationError('line unitCost cannot be negative');
  return {
    inventoryItemId: input.inventoryItemId || '',
    sku: input.sku || '',
    description: input.description,
    quantity,
    unitCost,
    receivedQuantity: Number(input.receivedQuantity || 0),
    lineTotal: Math.round(quantity * unitCost * 100) / 100,
    notes: input.notes || ''
  };
}

function normalizePurchaseOrderInput(input = {}) {
  if (!input.vendorId) throw validationError('vendorId is required');
  const lines = Array.isArray(input.lines) ? input.lines.map(normalizePurchaseOrderLine) : [];
  return {
    vendorId: input.vendorId,
    status: input.status || 'draft',
    orderDate: input.orderDate || new Date().toISOString().slice(0, 10),
    expectedDate: input.expectedDate || '',
    receivedDate: input.receivedDate || '',
    vendorReference: input.vendorReference || '',
    notes: input.notes || '',
    lines,
    subtotal: calculatePurchaseOrderSubtotal(lines),
    total: calculatePurchaseOrderSubtotal(lines)
  };
}

function calculatePurchaseOrderSubtotal(lines = []) {
  return Math.round(lines.reduce((sum, line) => sum + Number(line.lineTotal || 0), 0) * 100) / 100;
}

function calculateReceivedStatus(lines = []) {
  if (!lines.length) return 'draft';
  const totalQty = lines.reduce((sum, line) => sum + Number(line.quantity || 0), 0);
  const receivedQty = lines.reduce((sum, line) => sum + Number(line.receivedQuantity || 0), 0);
  if (receivedQty <= 0) return 'ordered';
  if (receivedQty >= totalQty) return 'received';
  return 'partially_received';
}

function applyReceivingToLines(lines = [], receivedLines = []) {
  const next = lines.map(line => ({ ...line }));
  for (const received of receivedLines) {
    const idx = next.findIndex(line =>
      (received.sku && line.sku === received.sku) ||
      (received.description && line.description === received.description) ||
      (received.inventoryItemId && line.inventoryItemId === received.inventoryItemId)
    );
    if (idx !== -1) {
      next[idx].receivedQuantity = Math.min(
        Number(next[idx].quantity || 0),
        Number(next[idx].receivedQuantity || 0) + Number(received.quantity || 0)
      );
    }
  }
  return next;
}

module.exports = {
  normalizeVendorInput,
  normalizePurchaseOrderLine,
  normalizePurchaseOrderInput,
  calculatePurchaseOrderSubtotal,
  calculateReceivedStatus,
  applyReceivingToLines
};
