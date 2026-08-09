const assert = require('assert');
const crypto = require('crypto');

process.env.DATA_STORE = 'json';
process.env.DATA_FILE = './data/test-stripe-payment-production.json';
process.env.STRIPE_WEBHOOK_SECRET = 'whsec_test_servicepro';

const { verifyWebhookSignature, createPaymentIntent } = require('../apps/api/src/services/paymentService');
const { resetRepositoriesForTest, getRepositories } = require('../apps/api/src/repositories/repositoryFactory');

const timestamp = 1800000000;
const payload = JSON.stringify({ id: 'evt_1', type: 'payment_intent.succeeded' });
const digest = crypto.createHmac('sha256', process.env.STRIPE_WEBHOOK_SECRET).update(`${timestamp}.${payload}`).digest('hex');
assert.deepStrictEqual(verifyWebhookSignature(payload, `t=${timestamp},v1=${digest}`, timestamp), JSON.parse(payload));
assert.strictEqual(verifyWebhookSignature(payload, `t=${timestamp},v1=${digest}`, timestamp + 301), null);
assert.strictEqual(verifyWebhookSignature(payload, `t=${timestamp},v1=invalid`, timestamp), null);

delete process.env.STRIPE_SECRET_KEY;
process.env.FEATURE_PAYMENTS_ENABLED = 'true';
assert.rejects(() => createPaymentIntent(100), error => error.code === 'stripe_not_configured');

resetRepositoriesForTest();
const repos = getRepositories();
repos.store.reset();
const invoice = repos.invoices.findById('tenant_demo', 'inv_demo_1');
const payment = repos.payments.create('tenant_demo', {
  invoiceId: invoice.id,
  customerId: invoice.customerId,
  amount: invoice.balanceDue,
  currency: 'usd',
  method: 'stripe',
  status: 'pending',
  stripePaymentIntentId: 'pi_production_test'
});
const event = {
  eventId: 'evt_production_test',
  eventType: 'payment_intent.succeeded',
  paymentIntentId: payment.stripePaymentIntentId,
  amountReceived: Math.round(payment.amount * 100),
  currency: 'usd'
};
const completed = repos.payments.completeStripePayment('tenant_demo', event);
assert.strictEqual(completed.payment.status, 'completed');
assert.strictEqual(completed.invoice.balanceDue, 0);
assert.strictEqual(repos.payments.completeStripePayment('tenant_demo', event).duplicate, true);

console.log('Stripe production payment test passed.');
