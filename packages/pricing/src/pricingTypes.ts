import { Money } from '../../types/src/core';

export type PriceLineInput = {
  code?: string;
  name: string;
  quantity: number;
  unitCost: Money;
  unitPrice: Money;
  taxable: boolean;
};

export type PriceCalculationInput = {
  currency: 'USD';
  lines: PriceLineInput[];
  taxRate: number;
  discountAmount?: number;
};

export type PriceCalculationResult = {
  subtotal: Money;
  discount: Money;
  taxableSubtotal: Money;
  tax: Money;
  total: Money;
  grossMarginPercent: number;
};
