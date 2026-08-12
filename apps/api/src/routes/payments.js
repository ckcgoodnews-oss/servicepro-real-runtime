const { sendJson } = require('../utils/http');
const { operationalTenant } = require('../services/tenantResolver');
const { createPaymentIntent, retrievePaymentIntent, verifyWebhookSignature, paymentsEnabled, isConfigured } = require('../services/paymentService');
const { getRepositoriesForTenant } = require('../repositories/repositoryFactory');
const { createInvoicePayment, refundInvoicePayment } = require('../services/customerPaymentService');

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
  const { invoiceId } = req.body || {};
  if (!invoiceId) {
    return sendJson(res, 400, { error: { code: 'validation_failed', message: 'invoiceId is required' } });
  }
  if (!paymentsEnabled() || !isConfigured()) {
    return sendJson(res, 503, { error: { code: 'payments_unavailable', message: 'Payments are not configured.' } });
  }

  Promise.resolve()
    .then(async () => {
      const tenantId = tenant(req);
      const invoice = await req.context.repositories.invoices.findById(tenantId, invoiceId);
      if (!invoice) return sendJson(res, 404, { error: { code: 'not_found', message: 'Invoice not found' } });
      const amount = Number(invoice.balanceDue);
      const amountCents = Math.round(amount * 100);
      if (!Number.isFinite(amount) || amountCents <= 0) return sendJson(res, 409, { error: { code: 'invoice_already_paid', message: 'Invoice has no outstanding balance.' } });
      const existing = await repo(req).findPendingByInvoice(tenantId, invoiceId);
      if (existing) {
        const intent = await retrievePaymentIntent(existing.stripePaymentIntentId);
        return sendJson(res, 200, { data: existing, clientSecret: intent.client_secret });
      }
      const currency = String(process.env.STRIPE_CURRENCY || 'usd').toLowerCase();
      const intent = await createPaymentIntent(amountCents, currency, {
        tenantId,
        invoiceId,
        customerId: invoice.customerId || ''
      }, `servicepro:${tenantId}:${invoiceId}:${amountCents}:${currency}`);

      const payment = await repo(req).create(tenantId, {
        invoiceId,
        customerId: invoice.customerId || '',
        amount,
        currency,
        method: 'stripe',
        status: 'pending',
        stripePaymentIntentId: intent.id || '',
        reference: intent.id || ''
      });

      return sendJson(res, 201, { data: payment, clientSecret: intent.client_secret });
    })
    .catch(err => sendJson(res, err.status || 500, { error: { code: err.code || 'payment_failed', message: err.message } }));
}

function confirm(req, res, id) {
  return sendJson(res, 410, { error: { code: 'webhook_confirmation_required', message: 'Payments are confirmed by Stripe webhooks only.' } });
}

function refund(req, res, id) {
  Promise.resolve(refundInvoicePayment(req.context.repositories,tenant(req),id,req.body||{}))
    .then(data=>sendJson(res,200,{data}))
    .catch(err=>sendJson(res,err.status||500,{error:{code:err.code||'refund_failed',message:err.message}}));
}

function createIntent(req,res){
  Promise.resolve(createInvoicePayment(req.context.repositories,tenant(req),req.body||{}))
    .then(data=>sendJson(res,data.idempotent?200:201,{data}))
    .catch(err=>sendJson(res,err.status||500,{error:{code:err.code||'payment_failed',message:err.message}}));
}

function ledger(req,res){
  const query=new URL(req.url,'http://servicepro.local').searchParams;
  Promise.resolve(req.context.repositories.customerPaymentEvents.list(tenant(req),{invoiceId:query.get('invoiceId')||'',limit:query.get('limit')||50}))
    .then(data=>sendJson(res,200,{data}))
    .catch(err=>sendJson(res,err.status||500,{error:{code:err.code||'ledger_failed',message:err.message}}));
}

function webhook(req, res) {
  const signature = req.headers['stripe-signature'] || '';
  const rawBody = req.rawBody || '';
  const event = verifyWebhookSignature(rawBody, signature);

  if (!event) {
    return sendJson(res, 400, { error: { code: 'invalid_signature', message: 'Webhook signature verification failed' } });
  }

  if (event.type !== 'payment_intent.succeeded') return sendJson(res, 200, { received: true, ignored: true });
  const intent = event.data?.object || {};
  const tenantId = intent.metadata?.tenantId;
  if (!event.id || !tenantId || !intent.id) return sendJson(res, 422, { error: { code: 'invalid_event_metadata', message: 'Stripe event metadata is incomplete.' } });
  Promise.resolve(getRepositoriesForTenant(tenantId).payments.completeStripePayment(tenantId, {
    eventId: event.id,
    eventType: event.type,
    paymentIntentId: intent.id,
    amountReceived: Number(intent.amount_received),
    currency: String(intent.currency || '').toLowerCase()
  }))
    .then(result => {
      if (result.missing) return sendJson(res, 422, { error: { code: 'payment_not_found', message: 'Stripe payment is not recognized.' } });
      if (result.mismatch) return sendJson(res, 422, { error: { code: 'payment_mismatch', message: 'Stripe payment does not match the invoice.' } });
      return sendJson(res, 200, { received: true, duplicate: Boolean(result.duplicate) });
    })
    .catch(err => sendJson(res, err.status || 500, { error: { code: err.code || 'webhook_processing_failed', message: err.message } }));
}

module.exports = { list, getById, create, confirm, refund, webhook, createIntent, ledger };
