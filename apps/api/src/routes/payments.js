const { sendJson } = require('../utils/http');
const { operationalTenant } = require('../services/tenantResolver');
const { createPaymentIntent, createRefund, verifyWebhookSignature } = require('../services/paymentService');
const { makeId, now } = require('../services/id');

function repo(req) { return req.context.repositories.payments; }
function tenant(req) { return operationalTenant(req); }

function list(req, res) {
  Promise.resolve(repo(req).list(tenant(req)))
    .then(data => sendJson(res, 200, { data }));
}

function getById(req, res, id) {
  Promise.resolve(repo(req).findById(tenant(req), id))
    .then(data => data
      ? sendJson(res, 200, { data })
      : sendJson(res, 404, { error: { code: 'not_found', message: 'Payment not found' } }));
}

function create(req, res) {
  const { invoiceId, amountCents, method } = req.body || {};
  if (!invoiceId || !amountCents) {
    return sendJson(res, 400, { error: { code: 'validation_failed', message: 'invoiceId and amountCents are required' } });
  }

  Promise.resolve()
    .then(async () => {
      const intent = await createPaymentIntent(amountCents, 'usd', {
        tenantId: tenant(req),
        invoiceId,
        customerId: req.body.customerId || ''
      });

      const payment = await repo(req).create(tenant(req), {
        invoiceId,
        amountCents,
        method: method || 'card',
        status: 'pending',
        stripePaymentIntentId: intent.id || '',
        clientSecret: intent.clientSecret || '',
        processedBy: req.context.userId || '',
        metadata: { stripeStatus: intent.status }
      });

      return sendJson(res, 201, { data: payment });
    })
    .catch(err => sendJson(res, err.status || 500, { error: { code: err.code || 'payment_failed', message: err.message } }));
}

function confirm(req, res, id) {
  Promise.resolve()
    .then(async () => {
      const payment = await repo(req).findById(tenant(req), id);
      if (!payment) return sendJson(res, 404, { error: { code: 'not_found', message: 'Payment not found' } });

      const updated = await repo(req).update(tenant(req), id, {
        status: 'completed',
        completedAt: now()
      });

      // Mark invoice as paid
      if (payment.invoiceId) {
        await req.context.repositories.invoices.update(tenant(req), payment.invoiceId, { status: 'paid', paidAt: now() });
      }

      return sendJson(res, 200, { data: updated });
    })
    .catch(err => sendJson(res, err.status || 500, { error: { code: 'error', message: err.message } }));
}

function refund(req, res, id) {
  const { amountCents, reason } = req.body || {};

  Promise.resolve()
    .then(async () => {
      const payment = await repo(req).findById(tenant(req), id);
      if (!payment) return sendJson(res, 404, { error: { code: 'not_found', message: 'Payment not found' } });
      if (payment.status !== 'completed') return sendJson(res, 400, { error: { code: 'invalid_state', message: 'Only completed payments can be refunded' } });

      const stripeRefund = await createRefund(payment.stripePaymentIntentId, amountCents);

      const updated = await repo(req).update(tenant(req), id, {
        status: amountCents && amountCents < payment.amountCents ? 'partially_refunded' : 'refunded',
        refundedAmountCents: amountCents || payment.amountCents,
        refundReason: reason || '',
        refundedAt: now(),
        stripeRefundId: stripeRefund.id || ''
      });

      return sendJson(res, 200, { data: updated });
    })
    .catch(err => sendJson(res, err.status || 500, { error: { code: 'refund_failed', message: err.message } }));
}

function webhook(req, res) {
  const signature = req.headers['stripe-signature'] || '';
  const rawBody = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
  const event = verifyWebhookSignature(rawBody, signature);

  if (!event) {
    return sendJson(res, 400, { error: { code: 'invalid_signature', message: 'Webhook signature verification failed' } });
  }

  // Process webhook event
  console.log(`[stripe-webhook] ${event.type}`, event.data?.object?.id);
  return sendJson(res, 200, { received: true });
}

module.exports = { list, getById, create, confirm, refund, webhook };
