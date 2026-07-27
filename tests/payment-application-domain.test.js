const assert = require('assert');
const { applyPaymentToInvoice } = require('../apps/api/src/services/paymentService');

const invoice = {
  id: 'inv_test',
  tenantId: 'tenant_a',
  total: 125,
  paidAmount: 0,
  balanceDue: 125,
  status: 'sent'
};

const partial = applyPaymentToInvoice(invoice, 25, '2026-07-27T12:00:00.000Z');
assert.strictEqual(partial.paidAmount, 25);
assert.strictEqual(partial.balanceDue, 100);
assert.strictEqual(partial.status, 'partially_paid');

const paid = applyPaymentToInvoice(partial, 100, '2026-07-27T13:00:00.000Z');
assert.strictEqual(paid.paidAmount, 125);
assert.strictEqual(paid.balanceDue, 0);
assert.strictEqual(paid.status, 'paid');
assert.strictEqual(paid.paidAt, '2026-07-27T13:00:00.000Z');

assert.throws(() => applyPaymentToInvoice(invoice, 0), error => error.code === 'invalid_payment_amount');
assert.throws(() => applyPaymentToInvoice(invoice, -1), error => error.code === 'invalid_payment_amount');
assert.throws(() => applyPaymentToInvoice(invoice, 126), error => error.code === 'payment_exceeds_balance');
assert.throws(() => applyPaymentToInvoice(null, 1), error => error.code === 'invoice_required');

console.log('Payment application domain test passed.');
