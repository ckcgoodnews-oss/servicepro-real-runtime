function calculateTax({ subtotal, taxRate }) {
  const base = Number(subtotal || 0);
  const rate = Number(taxRate || 0);
  return Math.round(base * rate * 100) / 100;
}

function calculateInvoiceTotal({ subtotal, discount = 0, taxRate = 0 }) {
  const net = Math.max(0, Number(subtotal || 0) - Number(discount || 0));
  const tax = calculateTax({ subtotal: net, taxRate });
  return {
    subtotal: Number(subtotal || 0),
    discount: Number(discount || 0),
    taxableAmount: net,
    tax,
    total: Math.round((net + tax) * 100) / 100
  };
}

module.exports = { calculateTax, calculateInvoiceTotal };
