const {sendEmail}=require('./notificationService');

function escapeHtml(value){return String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function money(cents,currency){return new Intl.NumberFormat('en-US',{style:'currency',currency:String(currency||'usd').toUpperCase()}).format(Number(cents||0)/100);}

async function sendPaymentReceipt(repos,tenantId,reconciliation){
  const payment=reconciliation.payment,invoice=reconciliation.invoice;
  const existing=await repos.paymentReceiptDeliveries.findByPayment(tenantId,payment.id);
  if(existing?.status==='sent')return existing;
  const settings=await repos.subscriberPaymentSettings.get(tenantId);
  const customer=payment.customerId?await repos.customers.findById(tenantId,payment.customerId):null;
  if(!settings.automaticReceipts||!customer?.email)return repos.paymentReceiptDeliveries.record(tenantId,{paymentId:payment.id,invoiceId:payment.invoiceId,customerId:payment.customerId||'',recipient:customer?.email||'',status:'skipped',errorCode:settings.automaticReceipts?'customer_email_missing':'automatic_receipts_disabled'});
  const tenant=await repos.tenantSettings.get(tenantId),company=tenant.companyName||tenant.branding?.appName||'Your service provider';
  const amountCents=Number(payment.amountCents??Math.round(Number(payment.amount||0)*100)),currency=payment.currency||'usd',reference=payment.stripeChargeId||payment.stripePaymentIntentId||payment.id;
  const html=`<h1>Payment receipt</h1><p>Thank you, ${escapeHtml(`${customer.firstName||''} ${customer.lastName||''}`.trim())}.</p><p>${escapeHtml(company)} received your payment.</p><table><tr><th align="left">Invoice</th><td>${escapeHtml(invoice.invoiceNumber||payment.invoiceId)}</td></tr><tr><th align="left">Payment date</th><td>${escapeHtml(new Date().toISOString())}</td></tr><tr><th align="left">Amount</th><td>${escapeHtml(money(amountCents,currency))}</td></tr><tr><th align="left">Remaining balance</th><td>${escapeHtml(money(Math.round(Number(invoice.balanceDue||0)*100),currency))}</td></tr><tr><th align="left">Reference</th><td>${escapeHtml(reference)}</td></tr></table>`;
  try{const sent=await sendEmail({to:customer.email,subject:`Payment receipt from ${company}`,html,text:`${company} received ${money(amountCents,currency)} for invoice ${invoice.invoiceNumber||payment.invoiceId}. Remaining balance: ${money(Math.round(Number(invoice.balanceDue||0)*100),currency)}. Reference: ${reference}.`});return repos.paymentReceiptDeliveries.record(tenantId,{paymentId:payment.id,invoiceId:payment.invoiceId,customerId:payment.customerId||'',recipient:customer.email,status:'sent',providerMessageId:sent.messageId||''});}
  catch(error){return repos.paymentReceiptDeliveries.record(tenantId,{paymentId:payment.id,invoiceId:payment.invoiceId,customerId:payment.customerId||'',recipient:customer.email,status:'failed',errorCode:error.code||'receipt_delivery_failed',errorMessage:error.message});}
}
module.exports={sendPaymentReceipt};
