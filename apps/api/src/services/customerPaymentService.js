const { stripeRequest, paymentsEnabled }=require('./paymentService');

function fail(message,code,status){throw Object.assign(new Error(message),{code,status});}
async function requireCapability(repos,tenantId){
  if(!paymentsEnabled())fail('Customer payments are disabled by the platform.','payments_disabled',503);
  const settings=await repos.subscriberPaymentSettings.get(tenantId);
  if(!settings.acceptCustomerPayments)fail('Customer payments are disabled for this subscriber.','customer_payments_disabled',403);
  const account=await repos.subscriberStripeAccounts.get(tenantId);
  if(!account||account.status!=='active'||!account.chargesEnabled)fail('The subscriber Stripe account is not able to accept charges.','stripe_account_not_active',409);
  return{settings,account};
}
async function createInvoicePayment(repos,tenantId,input={}){
  if(!input.invoiceId)fail('invoiceId is required.','validation_failed',400);
  if(!/^[A-Za-z0-9:_-]{8,200}$/.test(String(input.idempotencyKey||'')))fail('A valid idempotencyKey is required.','validation_failed',400);
  const{settings,account}=await requireCapability(repos,tenantId);
  const existing=(await repos.payments.list(tenantId)).find(x=>x.idempotencyKey===input.idempotencyKey);
  if(existing){const intent=await stripeRequest(`/v1/payment_intents/${encodeURIComponent(existing.stripePaymentIntentId)}`,{connectedAccountId:account.stripeAccountId});return{paymentId:existing.id,clientSecret:intent.client_secret,stripePaymentIntentId:intent.id,idempotent:true};}
  const invoice=await repos.invoices.findById(tenantId,input.invoiceId);
  if(!invoice)fail('Invoice not found.','not_found',404);
  const balanceCents=Math.round(Number(invoice.balanceDue)*100),requested=input.amountCents===undefined?balanceCents:Number(input.amountCents);
  if(!Number.isInteger(requested)||requested<=0||requested>balanceCents)fail('Payment amount must be positive and cannot exceed the current invoice balance.','invalid_payment_amount',400);
  if(requested<balanceCents&&!settings.partialPaymentsEnabled)fail('Partial payments are disabled.','partial_payments_disabled',409);
  const currency=String(invoice.currency||settings.defaultCurrency||'usd').toLowerCase();
  if(input.currency&&String(input.currency).toLowerCase()!==currency)fail('Payment currency does not match the invoice.','currency_mismatch',400);
  if(!Array.isArray(settings.acceptedMethods)||settings.acceptedMethods.length!==1||settings.acceptedMethods[0]!=='card')fail('The configured payment methods are not supported by this integration.','unsupported_payment_method',409);
  const intent=await stripeRequest('/v1/payment_intents',{method:'POST',connectedAccountId:account.stripeAccountId,idempotencyKey:`customer-invoice:${tenantId}:${input.idempotencyKey}`,body:new URLSearchParams({amount:String(requested),currency,'payment_method_types[]':'card','metadata[domain]':'customer_invoice','metadata[invoice_id]':invoice.id,'metadata[customer_id]':invoice.customerId||''})});
  const payment=await repos.payments.create(tenantId,{invoiceId:invoice.id,customerId:invoice.customerId||'',amount:requested/100,amountCents:requested,currency,method:'stripe_connect',status:'pending',stripePaymentIntentId:intent.id,stripeConnectedAccountId:account.stripeAccountId,idempotencyKey:input.idempotencyKey,paymentType:requested===balanceCents?'full':'partial',reference:intent.id});
  await repos.customerPaymentEvents.append(tenantId,{invoiceId:invoice.id,paymentId:payment.id,customerId:invoice.customerId||'',eventType:'payment_created',amountCents:requested,currency,balanceBeforeCents:balanceCents,balanceAfterCents:balanceCents,stripePaymentIntentId:intent.id,idempotencyKey:`payment-created:${input.idempotencyKey}`});
  return{paymentId:payment.id,clientSecret:intent.client_secret,stripePaymentIntentId:intent.id};
}
async function refundInvoicePayment(repos,tenantId,paymentId,input={}){
 const{account}=await requireCapability(repos,tenantId),payment=await repos.payments.findById(tenantId,paymentId);
 if(!payment)fail('Payment not found.','not_found',404);
 if(payment.stripeConnectedAccountId!==account.stripeAccountId)fail('Connected account does not own this payment.','stripe_account_mismatch',409);
 if(!['completed','succeeded','partially_refunded'].includes(payment.status))fail('Payment is not refundable.','payment_not_refundable',409);
 const refundable=Number(payment.amountCents||Math.round(payment.amount*100))-Number(payment.refundedAmountCents||0),amount=input.amountCents===undefined?refundable:Number(input.amountCents);
 if(!Number.isInteger(amount)||amount<=0||amount>refundable)fail('Refund amount exceeds the refundable balance.','invalid_refund_amount',400);
 const key=String(input.idempotencyKey||`refund:${payment.id}:${amount}:${payment.refundedAmountCents||0}`);
 const refund=await stripeRequest('/v1/refunds',{method:'POST',connectedAccountId:account.stripeAccountId,idempotencyKey:`customer-refund:${tenantId}:${key}`,body:new URLSearchParams({payment_intent:payment.stripePaymentIntentId,amount:String(amount),reason:['duplicate','fraudulent','requested_by_customer'].includes(input.reason)?input.reason:'requested_by_customer'})});
 await repos.customerPaymentEvents.append(tenantId,{invoiceId:payment.invoiceId,paymentId:payment.id,customerId:payment.customerId||'',eventType:'refund_requested',amountCents:amount,currency:payment.currency,stripePaymentIntentId:payment.stripePaymentIntentId,stripeRefundId:refund.id,idempotencyKey:`refund-requested:${refund.id}`,metadata:{reason:input.reason||'',stripeStatus:refund.status||'pending'}});
 return{refundId:refund.id,status:refund.status||'pending',amountCents:amount,paymentId:payment.id,reconciliation:'webhook_pending'};
}
module.exports={requireCapability,createInvoicePayment,refundInvoicePayment};
