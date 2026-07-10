function calculateMargin({ revenue, cost }) {
  const r = Number(revenue || 0);
  const c = Number(cost || 0);
  if (r <= 0) return 0;
  return ((r - c) / r) * 100;
}

function requiredPriceForMargin({ cost, targetMarginPercent }) {
  const c = Number(cost || 0);
  const m = Number(targetMarginPercent || 0) / 100;
  if (m >= 1) throw new Error('targetMarginPercent must be below 100');
  return c / (1 - m);
}

module.exports = { calculateMargin, requiredPriceForMargin };
