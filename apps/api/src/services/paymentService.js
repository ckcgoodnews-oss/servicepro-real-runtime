// Payment processing service - Stripe integration
// Uses environment variables: STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET

function stripeKey() { return process.env.STRIPE_SECRET_KEY || ''; }

function paymentsEnabled() {
  return String(process.env.FEATURE_PAYMENTS_ENABLED || '').toLowerCase() === 'true';
}

function money(value) {
  const amount = Number(value);
  if (!Number.isFinite(amount)) {
    const error = new TypeError('Payment amount must be a finite number.');
    error.code = 'invalid_payment_amount';
    throw error;
  }
  return Math.round((amount + Number.EPSILON) * 100) / 100;
}

function applyPaymentToInvoice(invoice, amount, at = new Date().toISOString()) {
  if (!invoice || typeof invoice !== 'object') {
    const error = new TypeError('Invoice is required.');
    error.code = 'invoice_required';
    throw error;
  }

  const paymentAmount = money(amount);
  if (paymentAmount <= 0) {
    const error = new RangeError('Payment amount must be greater than zero.');
    error.code = 'invalid_payment_amount';
    throw error;
  }

  const total = money(invoice.total || 0);
  const paidAmount = money(invoice.paidAmount || 0);
  const balanceDue = money(invoice.balanceDue ?? Math.max(0, total - paidAmount));
  if (paymentAmount > balanceDue) {
    const error = new RangeError('Payment amount cannot exceed the invoice balance.');
    error.code = 'payment_exceeds_balance';
    throw error;
  }

  const nextPaidAmount = money(paidAmount + paymentAmount);
  const nextBalanceDue = money(Math.max(0, balanceDue - paymentAmount));
  return {
    ...invoice,
    paidAmount: nextPaidAmount,
    balanceDue: nextBalanceDue,
    status: nextBalanceDue === 0 ? 'paid' : 'partially_paid',
    paidAt: nextBalanceDue === 0 ? (invoice.paidAt || at) : (invoice.paidAt || null),
    updatedAt: at
  };
}

function isConfigured() {
  return Boolean(stripeKey() && process.env.STRIPE_WEBHOOK_SECRET);
}

async function stripeRequest(path, { method = 'GET', body, idempotencyKey } = {}) {
  if (!stripeKey()) throw Object.assign(new Error('Stripe is not configured.'), { code: 'stripe_not_configured', status: 503 });

  const headers = { Authorization: `Bearer ${stripeKey()}` };
  if (body) headers['Content-Type'] = 'application/x-www-form-urlencoded';
  if (idempotencyKey) headers['Idempotency-Key'] = idempotencyKey;
  const res = await fetch(`https://api.stripe.com${path}`, { method, headers, body });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || data.error) {
    const error = new Error(data.error?.message || `Stripe request failed with status ${res.status}.`);
    error.code = data.error?.code || 'stripe_request_failed';
    error.status = 502;
    throw error;
  }
  return data;
}

async function createPaymentIntent(amountCents, currency = 'usd', metadata = {}, idempotencyKey = '') {
  if (!paymentsEnabled()) throw Object.assign(new Error('Payments are disabled.'), { code: 'payments_disabled', status: 503 });
  if (!Number.isInteger(amountCents) || amountCents <= 0) throw Object.assign(new Error('A positive integer amount in cents is required.'), { code: 'invalid_payment_amount', status: 400 });
  return stripeRequest('/v1/payment_intents', {
    method: 'POST', idempotencyKey,
    body: new URLSearchParams({
      amount: String(amountCents),
      currency,
      'automatic_payment_methods[enabled]': 'true',
      'metadata[tenantId]': metadata.tenantId || '',
      'metadata[invoiceId]': metadata.invoiceId || '',
      'metadata[customerId]': metadata.customerId || ''
    })
  });
}

async function retrievePaymentIntent(intentId) {
  if (!paymentsEnabled()) throw Object.assign(new Error('Payments are disabled.'), { code: 'payments_disabled', status: 503 });
  return stripeRequest(`/v1/payment_intents/${encodeURIComponent(intentId)}`);
}

async function createCustomer(email, name, metadata = {}) {
  return stripeRequest('/v1/customers', {
    method: 'POST',
    body: new URLSearchParams({ email, name, 'metadata[tenantId]': metadata.tenantId || '' })
  });
}

async function listPaymentMethods(customerId) {
  return stripeRequest(`/v1/payment_methods?customer=${encodeURIComponent(customerId)}&type=card`);
}

async function createRefund(paymentIntentId, amountCents) {
  const params = new URLSearchParams({ payment_intent: paymentIntentId });
  if (amountCents) params.set('amount', String(amountCents));
  return stripeRequest('/v1/refunds', { method: 'POST', body: params });
}

function verifyWebhookSignature(payload, signature, nowSeconds = Math.floor(Date.now() / 1000)) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET || '';
  if (!secret) return null;

  const crypto = require('crypto');
  const fields = String(signature || '').split(',').map(part => part.split('='));
  const timestamp = fields.find(([key]) => key === 't')?.[1];
  const signatures = fields.filter(([key]) => key === 'v1').map(([, value]) => value).filter(Boolean);
  if (!timestamp || !signatures.length || Math.abs(nowSeconds - Number(timestamp)) > 300) return null;

  const expected = crypto.createHmac('sha256', secret).update(`${timestamp}.${payload}`).digest('hex');
  const valid = signatures.some(sig => sig.length === expected.length && crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected)));
  if (!valid) return null;
  try { return JSON.parse(payload); } catch { return null; }
}

module.exports = {
  applyPaymentToInvoice,
  paymentsEnabled,
  isConfigured,
  createPaymentIntent,
  retrievePaymentIntent,
  createCustomer,
  listPaymentMethods,
  createRefund,
  verifyWebhookSignature
};
