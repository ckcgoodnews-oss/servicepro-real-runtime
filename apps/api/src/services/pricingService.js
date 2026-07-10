function roundMoney(value) {
  return Math.round(Number(value || 0) * 100) / 100;
}

function calculateLines(lines = [], taxRate = 0) {
  const normalizedLines = lines.map(line => {
    const quantity = Number(line.quantity || 1);
    const unitPrice = Number(line.unitPrice || 0);
    const unitCost = Number(line.unitCost || 0);
    const taxable = line.taxable !== false;
    const lineSubtotal = roundMoney(quantity * unitPrice);
    const lineCost = roundMoney(quantity * unitCost);

    return {
      code: line.code || '',
      name: line.name || '',
      description: line.description || '',
      quantity,
      unitPrice: roundMoney(unitPrice),
      unitCost: roundMoney(unitCost),
      taxable,
      lineSubtotal,
      lineCost
    };
  });

  const subtotal = roundMoney(normalizedLines.reduce((sum, line) => sum + line.lineSubtotal, 0));
  const costTotal = roundMoney(normalizedLines.reduce((sum, line) => sum + line.lineCost, 0));
  const taxableSubtotal = roundMoney(normalizedLines.filter(line => line.taxable).reduce((sum, line) => sum + line.lineSubtotal, 0));
  const tax = roundMoney(taxableSubtotal * Number(taxRate || 0));
  const total = roundMoney(subtotal + tax);
  const marginPercent = subtotal > 0 ? roundMoney(((subtotal - costTotal) / subtotal) * 100) : 0;

  return {
    lines: normalizedLines,
    subtotal,
    taxableSubtotal,
    tax,
    total,
    costTotal,
    marginPercent
  };
}

module.exports = { calculateLines, roundMoney };
