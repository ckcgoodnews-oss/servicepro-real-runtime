// Payment processing service - Stripe integration
// Uses environment variables: STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET

const STRIPE_KEY = process.env.STRIPE_SECRET_KEY || '';

function isConfigured() {
  return Boolean(STRIPE_KEY);
}

async function createPaymentIntent(amountCents, currency = 'usd', metadata = {}) {
  if (!isConfigured()) {
    return { id: `pi_simulated_${Date.now()}`, amount: amountCents, currency, status: 'requires_payment_method', clientSecret: `pi_simulated_${Date.now()}_secret_sim`, metadata };
  }

  const res = await fetch('https://api.stripe.com/v1/payment_intents', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${STRIPE_KEY}`, 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      amount: String(amountCents),
      currency,
      'metadata[tenantId]': metadata.tenantId || '',
      'metadata[invoiceId]': metadata.invoiceId || '',
      'metadata[customerId]': metadata.customerId || ''
    })
  });
  return res.json();
}

async function createCustomer(email, name, metadata = {}) {
  if (!isConfigured()) {
    return { id: `cus_simulated_${Date.now()}`, email, name, metadata };
  }

  const res = await fetch('https://api.stripe.com/v1/customers', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${STRIPE_KEY}`, 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ email, name, 'metadata[tenantId]': metadata.tenantId || '' })
  });
  return res.json();
}

async function listPaymentMethods(customerId) {
  if (!isConfigured()) return { data: [] };

  const res = await fetch(`https://api.stripe.com/v1/payment_methods?customer=${customerId}&type=card`, {
    headers: { 'Authorization': `Bearer ${STRIPE_KEY}` }
  });
  return res.json();
}

async function createRefund(paymentIntentId, amountCents) {
  if (!isConfigured()) {
    return { id: `re_simulated_${Date.now()}`, amount: amountCents, status: 'succeeded' };
  }

  const params = new URLSearchParams({ payment_intent: paymentIntentId });
  if (amountCents) params.set('amount', String(amountCents));

  const res = await fetch('https://api.stripe.com/v1/refunds', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${STRIPE_KEY}`, 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params
  });
  return res.json();
}

function verifyWebhookSignature(payload, signature) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET || '';
  if (!secret) return null;

  const crypto = require('crypto');
  const [, timestamp, sig] = (signature || '').match(/t=(\d+),v1=(\w+)/) || [];
  if (!timestamp || !sig) return null;

  const expected = crypto.createHmac('sha256', secret).update(`${timestamp}.${payload}`).digest('hex');
  return crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected)) ? JSON.parse(payload) : null;
}

module.exports = { isConfigured, createPaymentIntent, createCustomer, listPaymentMethods, createRefund, verifyWebhookSignature };
