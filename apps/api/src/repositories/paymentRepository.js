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
  if (!data.customerPaymentEvents) data.customerPaymentEvents = [];
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
        stripeChargeId: input.stripeChargeId || '',
        stripeConnectedAccountId: input.stripeConnectedAccountId || '',
        idempotencyKey: input.idempotencyKey || null,
        amountCents: input.amountCents ?? Math.round(Number(input.amount || 0) * 100),
        paymentType: input.paymentType || 'full',
        refundedAmountCents: input.refundedAmountCents || 0,
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
      if (event.connectedAccountId && payment.stripeConnectedAccountId !== event.connectedAccountId) return { accountMismatch: true };
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
      payment.stripeChargeId = event.stripeChargeId || payment.stripeChargeId || '';
      payment.completedAt = now();
      payment.updatedAt = now();
      data.stripeWebhookEvents.push({ ...event, status: 'processed', createdAt: now() });
      data.customerPaymentEvents.push({id:makeId('cpe'),tenantId,invoiceId:payment.invoiceId,paymentId:payment.id,customerId:payment.customerId,eventType:'payment_succeeded',domain:'customer_invoice',amountCents:event.amountReceived,currency:event.currency,balanceBeforeCents:Math.round(Number(invoice.balanceDue+payment.amount)*100),balanceAfterCents:Math.round(Number(invoice.balanceDue)*100),stripePaymentIntentId:event.paymentIntentId,stripeChargeId:event.stripeChargeId||'',idempotencyKey:`stripe-event:${event.eventId}`,createdAt:now()});
      store.write(data);
      return { payment, invoice };
    },
    failStripePayment(tenantId,input){const data=ensurePayments(store.read());if(data.stripeWebhookEvents.some(x=>x.eventId===input.eventId))return{duplicate:true};const payment=data.payments.find(x=>x.tenantId===tenantId&&x.stripePaymentIntentId===input.paymentIntentId);if(!payment)return{missing:true};payment.status='failed';payment.failedAt=now();payment.failureReason=input.failureReason||'';payment.updatedAt=now();data.stripeWebhookEvents.push({...input,status:'processed',createdAt:now()});data.customerPaymentEvents.push({id:makeId('cpe'),tenantId,invoiceId:payment.invoiceId,paymentId:payment.id,customerId:payment.customerId,eventType:'payment_failed',domain:'customer_invoice',amountCents:Number(payment.amountCents||0),currency:payment.currency,stripePaymentIntentId:payment.stripePaymentIntentId,idempotencyKey:`stripe-event:${input.eventId}`,metadata:{reason:input.failureReason||''},createdAt:now()});store.write(data);return{payment};},
    applyRefund(tenantId,id,input){const data=ensurePayments(store.read());if(data.stripeWebhookEvents.some(x=>x.eventId===input.eventId))return{duplicate:true};const payment=data.payments.find(x=>x.tenantId===tenantId&&x.id===id);if(!payment)return null;const invoice=(data.invoices||[]).find(x=>x.tenantId===tenantId&&x.id===payment.invoiceId);if(!invoice)return null;const amount=input.amountCents/100;payment.refundedAmountCents=Number(payment.refundedAmountCents||0)+input.amountCents;payment.stripeRefundId=input.stripeRefundId;payment.status=payment.refundedAmountCents>=payment.amountCents?'refunded':'partially_refunded';payment.refundedAt=now();invoice.paidAmount=Math.max(0,Math.round((Number(invoice.paidAmount||0)-amount)*100)/100);invoice.balanceDue=Math.min(Number(invoice.total||invoice.balanceDue+invoice.paidAmount),Math.round((Number(invoice.balanceDue||0)+amount)*100)/100);invoice.status=invoice.balanceDue>0?'partially_paid':'paid';invoice.updatedAt=now();data.stripeWebhookEvents.push({eventId:input.eventId,eventType:'charge.refunded',tenantId,paymentIntentId:payment.stripePaymentIntentId,status:'processed',createdAt:now()});data.customerPaymentEvents.push({id:makeId('cpe'),tenantId,invoiceId:invoice.id,paymentId:payment.id,customerId:payment.customerId,eventType:payment.status==='refunded'?'refund_succeeded':'partial_refund',domain:'customer_invoice',amountCents:input.amountCents,currency:payment.currency,stripePaymentIntentId:payment.stripePaymentIntentId,stripeRefundId:input.stripeRefundId,idempotencyKey:`stripe-event:${input.eventId}`,metadata:{reason:input.reason||''},createdAt:now()});store.write(data);return{payment,invoice};},
    recordDispute(tenantId,input){const data=ensurePayments(store.read());if(data.stripeWebhookEvents.some(x=>x.eventId===input.eventId))return{duplicate:true};const payment=data.payments.find(x=>x.tenantId===tenantId&&(x.stripeChargeId===input.chargeId||x.stripePaymentIntentId===input.paymentIntentId));if(!payment)return{missing:true};data.stripeWebhookEvents.push({...input,status:'processed',createdAt:now()});data.customerPaymentEvents.push({id:makeId('cpe'),tenantId,invoiceId:payment.invoiceId,paymentId:payment.id,customerId:payment.customerId,eventType:input.eventType,domain:'customer_invoice',amountCents:input.amountCents||Number(payment.amountCents||0),currency:input.currency||payment.currency,stripePaymentIntentId:payment.stripePaymentIntentId,stripeChargeId:payment.stripeChargeId,idempotencyKey:`stripe-event:${input.eventId}`,metadata:{disputeId:input.disputeId,status:input.status},createdAt:now()});store.write(data);return{payment};},
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
                stripe_payment_intent_id as "stripePaymentIntentId",stripe_charge_id as "stripeChargeId",
                stripe_connected_account_id as "stripeConnectedAccountId",idempotency_key as "idempotencyKey",
                amount_cents as "amountCents",currency,payment_type as "paymentType",refunded_amount_cents as "refundedAmountCents",
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
                stripe_payment_intent_id as "stripePaymentIntentId",stripe_charge_id as "stripeChargeId",stripe_connected_account_id as "stripeConnectedAccountId",idempotency_key as "idempotencyKey",amount_cents as "amountCents",currency,payment_type as "paymentType",refunded_amount_cents as "refundedAmountCents",
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
                stripe_event_id as "stripeEventId", stripe_charge_id as "stripeChargeId",
                amount_cents as "amountCents", refunded_amount_cents as "refundedAmountCents",
                stripe_connected_account_id as "stripeConnectedAccountId", received_at as "receivedAt",
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
        `INSERT INTO payments (tenant_id, invoice_id, customer_id, amount, method, reference, status, received_at, currency, stripe_payment_intent_id, stripe_event_id,stripe_connected_account_id,idempotency_key,amount_cents,payment_type)
         VALUES ($1, $2::uuid, NULLIF($3, '')::uuid, $4, $5, $6, $7, COALESCE($8::timestamptz, now()), $9, NULLIF($10,''), NULLIF($11,''),$12,NULLIF($13,''),$14,$15)
         RETURNING id::text, tenant_id as "tenantId", invoice_id::text as "invoiceId",
                   customer_id::text as "customerId", amount::float, method, reference, status,
                   currency, stripe_payment_intent_id as "stripePaymentIntentId",
                   stripe_event_id as "stripeEventId",stripe_connected_account_id as "stripeConnectedAccountId",idempotency_key as "idempotencyKey",amount_cents as "amountCents",payment_type as "paymentType",
                   received_at as "receivedAt", created_at as "createdAt", updated_at as "updatedAt"`,
        [tenantId, input.invoiceId, input.customerId || '', Number(input.amount || 0), input.method || 'manual', input.reference || '', input.status || 'posted', input.receivedAt || null, input.currency || 'usd', input.stripePaymentIntentId || '', input.stripeEventId || '',input.stripeConnectedAccountId||'',input.idempotencyKey||'',input.amountCents??Math.round(Number(input.amount||0)*100),input.paymentType||'full']
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
          `SELECT id::text, invoice_id::text as "invoiceId",customer_id::text as "customerId", amount::float, currency,stripe_connected_account_id as "stripeConnectedAccountId"
           FROM payments WHERE tenant_id=$1 AND stripe_payment_intent_id=$2 FOR UPDATE`,
          [tenantId, event.paymentIntentId]
        );
        const payment = paymentResult.rows[0];
        if (!payment) throw Object.assign(new Error('Stripe payment intent is not recognized.'), { code: 'unknown_payment_intent', status: 422 });
        if (event.connectedAccountId && payment.stripeConnectedAccountId !== event.connectedAccountId) throw Object.assign(new Error('Stripe connected account does not own this payment.'), { code: 'stripe_account_mismatch', status: 422 });
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
          `UPDATE payments SET status='completed',stripe_event_id=$3,stripe_charge_id=$4,completed_at=now(),updated_at=now() WHERE tenant_id=$1 AND id=$2`,
          [tenantId, payment.id, event.eventId,event.stripeChargeId||'']
        );
        await tx.query(
          `INSERT INTO payment_application_events (tenant_id,invoice_id,amount,previous_balance,new_balance)
           VALUES ($1,$2,$3,$4,$5)`, [tenantId, payment.invoiceId, payment.amount, invoice.balanceDue, nextBalance]
        );
        await tx.query(`INSERT INTO customer_payment_events(tenant_id,invoice_id,payment_id,customer_id,event_type,domain,amount_cents,currency,balance_before_cents,balance_after_cents,stripe_payment_intent_id,stripe_charge_id,idempotency_key) VALUES($1,$2,$3,$4,'payment_succeeded','customer_invoice',$5,$6,$7,$8,$9,$10,$11) ON CONFLICT(idempotency_key) DO NOTHING`,[tenantId,payment.invoiceId,payment.id,payment.customerId,event.amountReceived,event.currency,Math.round(Number(invoice.balanceDue)*100),Math.round(nextBalance*100),event.paymentIntentId,event.stripeChargeId||'',`stripe-event:${event.eventId}`]);
        await tx.query(`UPDATE stripe_webhook_events SET status='processed' WHERE event_id=$1`, [event.eventId]);
        return { payment: { ...payment, status: 'completed', stripeEventId: event.eventId }, invoice: { ...invoice, paidAmount: nextPaid, balanceDue: nextBalance } };
      });
    },
    async failStripePayment(tenantId,input){return store.transaction(async tx=>{const inserted=await tx.query(`INSERT INTO stripe_webhook_events(event_id,event_type,tenant_id,payment_intent_id,status) VALUES($1,$2,$3,$4,'processing') ON CONFLICT(event_id) DO NOTHING`,[input.eventId,input.eventType,tenantId,input.paymentIntentId]);if(!inserted.rowCount)return{duplicate:true};const p=await tx.query(`UPDATE payments SET status='failed',failed_at=now(),failure_reason=$3,updated_at=now() WHERE tenant_id=$1 AND stripe_payment_intent_id=$2 RETURNING id::text,invoice_id::text AS "invoiceId",customer_id::text AS "customerId",amount_cents AS "amountCents",currency`,[tenantId,input.paymentIntentId,input.failureReason||'']);const payment=p.rows[0];if(!payment)throw Object.assign(new Error('Stripe payment intent is not recognized.'),{code:'unknown_payment_intent',status:422});await tx.query(`INSERT INTO customer_payment_events(tenant_id,invoice_id,payment_id,customer_id,event_type,domain,amount_cents,currency,stripe_payment_intent_id,idempotency_key,metadata) VALUES($1,$2,$3,$4,'payment_failed','customer_invoice',$5,$6,$7,$8,$9::jsonb) ON CONFLICT(idempotency_key) DO NOTHING`,[tenantId,payment.invoiceId,payment.id,payment.customerId,payment.amountCents,payment.currency,input.paymentIntentId,`stripe-event:${input.eventId}`,JSON.stringify({reason:input.failureReason||''})]);await tx.query(`UPDATE stripe_webhook_events SET status='processed' WHERE event_id=$1`,[input.eventId]);return{payment};});},
    async applyRefund(tenantId,id,input){return store.transaction(async tx=>{const inserted=await tx.query(`INSERT INTO stripe_webhook_events(event_id,event_type,tenant_id,payment_intent_id,status) VALUES($1,'charge.refunded',$2,$3,'processing') ON CONFLICT(event_id) DO NOTHING`,[input.eventId,tenantId,input.paymentIntentId||'']);if(!inserted.rowCount)return{duplicate:true};const p=await tx.query(`SELECT id::text,invoice_id::text AS "invoiceId",customer_id::text AS "customerId",amount_cents AS "amountCents",currency,stripe_payment_intent_id AS "stripePaymentIntentId",refunded_amount_cents AS "refundedAmountCents" FROM payments WHERE tenant_id=$1 AND id=$2 FOR UPDATE`,[tenantId,id]);const payment=p.rows[0];if(!payment)throw Object.assign(new Error('Refund payment is not recognized.'),{code:'unknown_refund_payment',status:422});const i=await tx.query(`SELECT id::text,total::float,paid_amount::float AS "paidAmount",balance_due::float AS "balanceDue" FROM invoices WHERE tenant_id=$1 AND id=$2 FOR UPDATE`,[tenantId,payment.invoiceId]);const invoice=i.rows[0];if(!invoice)throw Object.assign(new Error('Refund invoice is not recognized.'),{code:'invoice_not_found',status:422});const nextRefund=Number(payment.refundedAmountCents||0)+input.amountCents,amount=input.amountCents/100,nextPaid=Math.max(0,Math.round((Number(invoice.paidAmount||0)-amount)*100)/100),nextBalance=Math.min(Number(invoice.total),Math.round((Number(invoice.balanceDue||0)+amount)*100)/100),status=nextRefund>=payment.amountCents?'refunded':'partially_refunded';await tx.query(`UPDATE payments SET refunded_amount_cents=$3,stripe_refund_id=$4,refunded_at=now(),status=$5,updated_at=now() WHERE tenant_id=$1 AND id=$2`,[tenantId,id,nextRefund,input.stripeRefundId,status]);await tx.query(`UPDATE invoices SET paid_amount=$3,balance_due=$4,status=$5,updated_at=now() WHERE tenant_id=$1 AND id=$2`,[tenantId,payment.invoiceId,nextPaid,nextBalance,nextBalance===0?'paid':'partially_paid']);await tx.query(`INSERT INTO customer_payment_events(tenant_id,invoice_id,payment_id,customer_id,event_type,domain,amount_cents,currency,stripe_payment_intent_id,stripe_refund_id,idempotency_key,metadata) VALUES($1,$2,$3,$4,$5,'customer_invoice',$6,$7,$8,$9,$10,$11::jsonb) ON CONFLICT(idempotency_key) DO NOTHING`,[tenantId,payment.invoiceId,id,payment.customerId,status==='refunded'?'refund_succeeded':'partial_refund',input.amountCents,payment.currency,payment.stripePaymentIntentId,input.stripeRefundId,`stripe-event:${input.eventId}`,JSON.stringify({reason:input.reason||''})]);await tx.query(`UPDATE stripe_webhook_events SET status='processed' WHERE event_id=$1`,[input.eventId]);return{payment:{...payment,status,refundedAmountCents:nextRefund,stripeRefundId:input.stripeRefundId},invoice:{...invoice,paidAmount:nextPaid,balanceDue:nextBalance,status:nextBalance===0?'paid':'partially_paid'}};});},
    async recordDispute(tenantId,input){return store.transaction(async tx=>{const inserted=await tx.query(`INSERT INTO stripe_webhook_events(event_id,event_type,tenant_id,payment_intent_id,status) VALUES($1,$2,$3,$4,'processing') ON CONFLICT(event_id) DO NOTHING`,[input.eventId,input.eventType,tenantId,input.paymentIntentId||'']);if(!inserted.rowCount)return{duplicate:true};const p=await tx.query(`SELECT id::text,invoice_id::text AS "invoiceId",customer_id::text AS "customerId",amount_cents AS "amountCents",currency,stripe_payment_intent_id AS "stripePaymentIntentId",stripe_charge_id AS "stripeChargeId" FROM payments WHERE tenant_id=$1 AND (stripe_charge_id=$2 OR stripe_payment_intent_id=$3) LIMIT 1 FOR UPDATE`,[tenantId,input.chargeId||'',input.paymentIntentId||'']);const payment=p.rows[0];if(!payment)throw Object.assign(new Error('Disputed payment is not recognized.'),{code:'unknown_disputed_payment',status:422});await tx.query(`INSERT INTO customer_payment_events(tenant_id,invoice_id,payment_id,customer_id,event_type,domain,amount_cents,currency,stripe_payment_intent_id,stripe_charge_id,idempotency_key,metadata) VALUES($1,$2,$3,$4,$5,'customer_invoice',$6,$7,$8,$9,$10,$11::jsonb) ON CONFLICT(idempotency_key) DO NOTHING`,[tenantId,payment.invoiceId,payment.id,payment.customerId,input.eventType,input.amountCents||payment.amountCents,input.currency||payment.currency,payment.stripePaymentIntentId,payment.stripeChargeId,`stripe-event:${input.eventId}`,JSON.stringify({disputeId:input.disputeId||'',status:input.status||''})]);await tx.query(`UPDATE stripe_webhook_events SET status='processed' WHERE event_id=$1`,[input.eventId]);return{payment};});},
    async delete(tenantId, id) {
      const result = await store.query('DELETE FROM payments WHERE tenant_id = $1 AND id = $2', [tenantId, id]);
      return result.rowCount > 0;
    }
  };
}

module.exports = { createPaymentRepository };
