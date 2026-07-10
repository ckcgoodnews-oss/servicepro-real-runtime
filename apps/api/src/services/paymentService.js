const { roundMoney } = require('./pricingService');

function statusForBalance(total, paidAmount) {
  const totalAmount = roundMoney(total || 0);
  const paid = roundMoney(paidAmount || 0);
  const balanceDue = roundMoney(totalAmount - paid);

  if (balanceDue <= 0 && totalAmount > 0) return 'paid';
  if (paid > 0 && balanceDue > 0) return 'partially_paid';
  return 'sent';
}

function applyPaymentToInvoice(invoice, paymentAmount) {
  const nextPaidAmount = roundMoney(Number(invoice.paidAmount || 0) + Number(paymentAmount || 0));
  const balanceDue = roundMoney(Number(invoice.total || 0) - nextPaidAmount);
  return {
    ...invoice,
    paidAmount: nextPaidAmount,
    balanceDue,
    status: statusForBalance(invoice.total, nextPaidAmount),
    updatedAt: new Date().toISOString()
  };
}

module.exports = { applyPaymentToInvoice, statusForBalance };
