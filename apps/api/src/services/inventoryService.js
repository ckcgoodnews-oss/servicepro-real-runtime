function roundQuantity(value) {
  return Math.round(Number(value || 0) * 1000) / 1000;
}

function applyStockDelta(item, delta) {
  const nextQuantity = roundQuantity(Number(item.quantityOnHand || 0) + Number(delta || 0));
  if (nextQuantity < 0) {
    const err = new Error('Insufficient stock for inventory item');
    err.status = 409;
    err.code = 'insufficient_stock';
    throw err;
  }

  return {
    ...item,
    quantityOnHand: nextQuantity,
    updatedAt: new Date().toISOString()
  };
}

function validateStockAdjustment(input) {
  if (!input.inventoryItemId) {
    const err = new Error('inventoryItemId is required');
    err.status = 400;
    err.code = 'validation_failed';
    throw err;
  }
  if (input.quantityDelta === undefined || Number.isNaN(Number(input.quantityDelta))) {
    const err = new Error('quantityDelta is required and must be numeric');
    err.status = 400;
    err.code = 'validation_failed';
    throw err;
  }
}

function validateMaterialUsage(input) {
  if (!input.jobId || !input.inventoryItemId || input.quantity === undefined) {
    const err = new Error('jobId, inventoryItemId, and quantity are required');
    err.status = 400;
    err.code = 'validation_failed';
    throw err;
  }
  if (Number(input.quantity) <= 0) {
    const err = new Error('quantity must be greater than zero');
    err.status = 400;
    err.code = 'validation_failed';
    throw err;
  }
}

module.exports = { roundQuantity, applyStockDelta, validateStockAdjustment, validateMaterialUsage };
