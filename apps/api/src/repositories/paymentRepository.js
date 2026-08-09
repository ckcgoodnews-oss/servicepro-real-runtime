const { makeId, now } = require('../services/id');
const { requireFields } = require('../utils/validation');

function createPaymentRepository(store) {
  if (store.type === 'json') return createJsonPaymentRepository(store);
  if (store.type === 'postgres') return createPostgresPaymentRepository(store);
  throw new Error(`Unsupported store type: ${store.type}`);
}

function ensurePayments(data) {
  if (!data.payments) data.payments = [];
  if (!data.stripeWebhookEvents) data.stripeWebhookEvents = [];
  return data;
}

function createJsonPaymentRepository(store) {
  return {
    list(tenantId) {
      return ensurePayments(store.read()).payments.filter(p => p.tenantId === tenantId);
    },
    findById(tenantId, id) {
      return ensurePayments(store.read()).payments.find(p => p.tenantId === tenantId && p.id === id) || null;
    },
    findByStripeIntent(tenantId, intentId) {
      return ensurePayments(store.read()).payments.find(p => p.tenantId === tenantId && p.stripePaymentIntentId === intentId) || null;
    },
    findPendingByInvoice(tenantId, invoiceId) {
      return ensurePayments(store.read()).payments.find(p => p.tenantId === tenantId && p.invoiceId === invoiceId && p.status === 'pending') || null;
    },
    create(tenantId, input) {
      requireFields(input, ['invoiceId', 'amount']);
      const data = ensurePayments(store.read());
      const payment = {
        id: makeId('pay'),
        tenantId,
        invoiceId: input.invoiceId,
        customerId: input.customerId || '',
        amount: Math.round(Number(input.amount || 0) * 100) / 100,
        method: input.method || 'manual',
        reference: input.reference || '',
        status: input.status || 'posted',
        currency: input.currency || 'usd',
        stripePaymentIntentId: input.stripePaymentIntentId || '',
        stripeEventId: input.stripeEventId || '',
        receivedAt: input.receivedAt || now(),
        createdAt: now(),
        updatedAt: now()
      };
      data.payments.push(payment);
      store.write(data);
      return payment;
    },
    update(tenantId, id, input) {
      const data = ensurePayments(store.read());
      const row = data.payments.find(p => p.tenantId === tenantId && p.id === id);
      if (!row) return null;
      Object.assign(row, input, { id, tenantId, updatedAt: now() });
      store.write(data);
      return row;
    },
    recordStripeEvent(event) {
      const data = ensurePayments(store.read());
      if (data.stripeWebhookEvents.some(row => row.eventId === event.eventId)) return false;
      data.stripeWebhookEvents.push({ ...event, createdAt: now() });
      store.write(data);
      return true;
    },
    completeStripePayment(tenantId, event) {
      const data = ensurePayments(store.read());
      if (data.stripeWebhookEvents.some(row => row.eventId === event.eventId)) return { duplicate: true };
      const payment = data.payments.find(row => row.tenantId === tenantId && row.stripePaymentIntentId === event.paymentIntentId);
      if (!payment) return { missing: true };
      const invoice = (data.invoices || []).find(row => row.tenantId === tenantId && row.id === payment.invoiceId);
      if (!invoice) return { missing: true };
      const expectedCents = Math.round(Number(payment.amount) * 100);
      if (expectedCents !== event.amountReceived || payment.currency !== event.currency) return { mismatch: true };
      const paidAmount = Math.round((Number(invoice.paidAmount || 0) + Number(payment.amount)) * 100) / 100;
      invoice.paidAmount = paidAmount;
      invoice.balanceDue = Math.max(0, Math.round((Number(invoice.total || 0) - paidAmount) * 100) / 100);
      invoice.status = invoice.balanceDue === 0 ? 'paid' : 'partially_paid';
      invoice.updatedAt = now();
      payment.status = 'completed';
      payment.stripeEventId = event.eventId;
      payment.updatedAt = now();
      data.stripeWebhookEvents.push({ ...event, status: 'processed', createdAt: now() });
      store.write(data);
      return { payment, invoice };
    },
    delete(tenantId, id) {
      const data = ensurePayments(store.read());
      const before = data.payments.length;
      data.payments = data.payments.filter(p => !(p.tenantId === tenantId && p.id === id));
      const deleted = data.payments.length !== before;
      if (deleted) store.write(data);
      return deleted;
    }
  };
}

function createPostgresPaymentRepository(store) {
  return {
    async list(tenantId) {
      const result = await store.query(
        `SELECT id::text, tenant_id as "tenantId", invoice_id::text as "invoiceId",
                customer_id::text as "customerId", amount::float, method, reference, status,
                received_at as "receivedAt", created_at as "createdAt", updated_at as "updatedAt"
         FROM payments
         WHERE tenant_id = $1
         ORDER BY received_at DESC`,
        [tenantId]
      );
      return result.rows;
    },
    async findById(tenantId, id) {
      const result = await store.query(
        `SELECT id::text, tenant_id as "tenantId", invoice_id::text as "invoiceId",
                customer_id::text as "customerId", amount::float, method, reference, status,
                received_at as "receivedAt", created_at as "createdAt", updated_at as "updatedAt"
         FROM payments
         WHERE tenant_id = $1 AND id = $2
         LIMIT 1`,
        [tenantId, id]
      );
      return result.rows[0] || null;
    },
    async findByStripeIntent(tenantId, intentId) {
      const result = await store.query(
        `SELECT id::text, tenant_id as "tenantId", invoice_id::text as "invoiceId",
                customer_id::text as "customerId", amount::float, method, reference, status,
                currency, stripe_payment_intent_id as "stripePaymentIntentId",
                stripe_event_id as "stripeEventId", received_at as "receivedAt",
                created_at as "createdAt", updated_at as "updatedAt"
         FROM payments WHERE tenant_id=$1 AND stripe_payment_intent_id=$2 LIMIT 1`,
        [tenantId, intentId]
      );
      return result.rows[0] || null;
    },
    async findPendingByInvoice(tenantId, invoiceId) {
      const result = await store.query(
        `SELECT id::text, tenant_id as "tenantId", invoice_id::text as "invoiceId",
                customer_id::text as "customerId", amount::float, method, reference, status,
                currency, stripe_payment_intent_id as "stripePaymentIntentId",
                stripe_event_id as "stripeEventId", received_at as "receivedAt",
                created_at as "createdAt", updated_at as "updatedAt"
         FROM payments WHERE tenant_id=$1 AND invoice_id=$2 AND status='pending'
         ORDER BY created_at DESC LIMIT 1`, [tenantId, invoiceId]
      );
      return result.rows[0] || null;
    },
    async create(tenantId, input) {
      requireFields(input, ['invoiceId', 'amount']);
      const result = await store.query(
        `INSERT INTO payments (tenant_id, invoice_id, customer_id, amount, method, reference, status, received_at, currency, stripe_payment_intent_id, stripe_event_id)
         VALUES ($1, $2::uuid, NULLIF($3, '')::uuid, $4, $5, $6, $7, COALESCE($8::timestamptz, now()), $9, NULLIF($10,''), NULLIF($11,''))
         RETURNING id::text, tenant_id as "tenantId", invoice_id::text as "invoiceId",
                   customer_id::text as "customerId", amount::float, method, reference, status,
                   currency, stripe_payment_intent_id as "stripePaymentIntentId",
                   stripe_event_id as "stripeEventId",
                   received_at as "receivedAt", created_at as "createdAt", updated_at as "updatedAt"`,
        [tenantId, input.invoiceId, input.customerId || '', Number(input.amount || 0), input.method || 'manual', input.reference || '', input.status || 'posted', input.receivedAt || null, input.currency || 'usd', input.stripePaymentIntentId || '', input.stripeEventId || '']
      );
      return result.rows[0];
    },
    async update(tenantId, id, input) {
      const result = await store.query(
        `UPDATE payments SET status=COALESCE($3,status), stripe_event_id=COALESCE(NULLIF($4,''),stripe_event_id), updated_at=now()
         WHERE tenant_id=$1 AND id=$2
         RETURNING id::text, tenant_id as "tenantId", invoice_id::text as "invoiceId", amount::float, status,
                   currency, stripe_payment_intent_id as "stripePaymentIntentId", stripe_event_id as "stripeEventId"`,
        [tenantId, id, input.status || null, input.stripeEventId || '']
      );
      return result.rows[0] || null;
    },
    async recordStripeEvent(event) {
      const result = await store.query(
        `INSERT INTO stripe_webhook_events (event_id,event_type,tenant_id,payment_intent_id,status)
         VALUES ($1,$2,$3,$4,$5) ON CONFLICT(event_id) DO NOTHING`,
        [event.eventId, event.eventType, event.tenantId, event.paymentIntentId || '', event.status || 'received']
      );
      return result.rowCount > 0;
    },
    async completeStripePayment(tenantId, event) {
      return store.transaction(async tx => {
        const inserted = await tx.query(
          `INSERT INTO stripe_webhook_events (event_id,event_type,tenant_id,payment_intent_id,status)
           VALUES ($1,$2,$3,$4,'processing') ON CONFLICT(event_id) DO NOTHING`,
          [event.eventId, event.eventType, tenantId, event.paymentIntentId]
        );
        if (!inserted.rowCount) return { duplicate: true };
        const paymentResult = await tx.query(
          `SELECT id::text, invoice_id::text as "invoiceId", amount::float, currency
           FROM payments WHERE tenant_id=$1 AND stripe_payment_intent_id=$2 FOR UPDATE`,
          [tenantId, event.paymentIntentId]
        );
        const payment = paymentResult.rows[0];
        if (!payment) throw Object.assign(new Error('Stripe payment intent is not recognized.'), { code: 'unknown_payment_intent', status: 422 });
        if (Math.round(Number(payment.amount) * 100) !== event.amountReceived || payment.currency !== event.currency) {
          throw Object.assign(new Error('Stripe payment amount or currency does not match the invoice.'), { code: 'payment_mismatch', status: 422 });
        }
        const invoiceResult = await tx.query(
          `SELECT id::text, total::float, paid_amount::float as "paidAmount", balance_due::float as "balanceDue"
           FROM invoices WHERE tenant_id=$1 AND id=$2 FOR UPDATE`, [tenantId, payment.invoiceId]
        );
        const invoice = invoiceResult.rows[0];
        if (!invoice) throw Object.assign(new Error('Payment invoice was not found.'), { code: 'invoice_not_found', status: 422 });
        const nextPaid = Math.round((Number(invoice.paidAmount || 0) + Number(payment.amount)) * 100) / 100;
        const nextBalance = Math.max(0, Math.round((Number(invoice.total) - nextPaid) * 100) / 100);
        await tx.query(
          `UPDATE invoices SET paid_amount=$3,balance_due=$4,status=$5,updated_at=now() WHERE tenant_id=$1 AND id=$2`,
          [tenantId, payment.invoiceId, nextPaid, nextBalance, nextBalance === 0 ? 'paid' : 'partially_paid']
        );
        await tx.query(
          `UPDATE payments SET status='completed',stripe_event_id=$3,updated_at=now() WHERE tenant_id=$1 AND id=$2`,
          [tenantId, payment.id, event.eventId]
        );
        await tx.query(
          `INSERT INTO payment_application_events (tenant_id,invoice_id,amount,previous_balance,new_balance)
           VALUES ($1,$2,$3,$4,$5)`, [tenantId, payment.invoiceId, payment.amount, invoice.balanceDue, nextBalance]
        );
        await tx.query(`UPDATE stripe_webhook_events SET status='processed' WHERE event_id=$1`, [event.eventId]);
        return { payment: { ...payment, status: 'completed', stripeEventId: event.eventId }, invoice: { ...invoice, paidAmount: nextPaid, balanceDue: nextBalance } };
      });
    },
    async delete(tenantId, id) {
      const result = await store.query('DELETE FROM payments WHERE tenant_id = $1 AND id = $2', [tenantId, id]);
      return result.rowCount > 0;
    }
  };
}

module.exports = { createPaymentRepository };
