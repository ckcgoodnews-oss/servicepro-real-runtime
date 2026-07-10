import { PriceCalculationInput, PriceCalculationResult } from './pricingTypes';

function round(amount: number): number {
  return Math.round(amount * 100) / 100;
}

export function calculatePrice(input: PriceCalculationInput): PriceCalculationResult {
  const subtotalAmount = input.lines.reduce((sum, line) => sum + line.quantity * line.unitPrice.amount, 0);
  const costAmount = input.lines.reduce((sum, line) => sum + line.quantity * line.unitCost.amount, 0);
  const discountAmount = input.discountAmount || 0;
  const taxableSubtotalAmount = input.lines
    .filter(line => line.taxable)
    .reduce((sum, line) => sum + line.quantity * line.unitPrice.amount, 0) - discountAmount;
  const taxAmount = Math.max(0, taxableSubtotalAmount) * input.taxRate;
  const totalAmount = subtotalAmount - discountAmount + taxAmount;
  const grossMarginPercent = subtotalAmount > 0 ? ((subtotalAmount - costAmount) / subtotalAmount) * 100 : 0;

  return {
    subtotal: { amount: round(subtotalAmount), currency: input.currency },
    discount: { amount: round(discountAmount), currency: input.currency },
    taxableSubtotal: { amount: round(Math.max(0, taxableSubtotalAmount)), currency: input.currency },
    tax: { amount: round(taxAmount), currency: input.currency },
    total: { amount: round(totalAmount), currency: input.currency },
    grossMarginPercent: round(grossMarginPercent)
  };
}
