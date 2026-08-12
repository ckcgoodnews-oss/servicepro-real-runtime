const { sendJson }=require('../utils/http');
const { verifyWebhookSignature }=require('../services/paymentService');
const { getRepositories,getRepositoriesForTenant }=require('../repositories/repositoryFactory');
const { accountRecord }=require('../services/stripeConnectService');
const { sendPaymentReceipt }=require('../services/paymentReceiptService');

function signedEvent(req,secret){return verifyWebhookSignature(req.rawBody||'',req.headers['stripe-signature']||'',Math.floor(Date.now()/1000),secret);}
function platform(req,res){const event=signedEvent(req,process.env.STRIPE_WEBHOOK_SECRET_PLATFORM||'');if(!event)return sendJson(res,400,{error:{code:'invalid_signature',message:'Webhook signature verification failed.'}});return sendJson(res,200,{received:true,eventId:event.id});}
function connect(req,res){
 const event=signedEvent(req,process.env.STRIPE_WEBHOOK_SECRET_CONNECT||'');
 if(!event)return sendJson(res,400,{error:{code:'invalid_signature',message:'Webhook signature verification failed.'}});
 if(!event.id||!event.account)return sendJson(res,422,{error:{code:'invalid_connect_event',message:'Connected-account event ownership is missing.'}});
 return Promise.resolve().then(async()=>{
   const global=getRepositories(),ownership=await global.subscriberStripeAccounts.findByStripeAccountId(event.account);
   if(!ownership)return sendJson(res,422,{error:{code:'unknown_connected_account',message:'Connected Stripe account is not recognized.'}});
   const repos=getRepositoriesForTenant(ownership.tenantId),object=event.data?.object||{};
   if(event.type==='account.updated'){
     if(object.id!==event.account)return sendJson(res,422,{error:{code:'stripe_account_mismatch',message:'Account event does not match its event owner.'}});
     await repos.subscriberStripeAccounts.upsert(ownership.tenantId,accountRecord(object));
     if(!object.charges_enabled)await repos.subscriberPaymentSettings.upsert(ownership.tenantId,{acceptCustomerPayments:false});
     return sendJson(res,200,{received:true});
   }
   if(event.type==='payment_intent.succeeded'){
     const result=await repos.payments.completeStripePayment(ownership.tenantId,{eventId:event.id,eventType:event.type,paymentIntentId:object.id,connectedAccountId:event.account,stripeChargeId:typeof object.latest_charge==='string'?object.latest_charge:'',amountReceived:Number(object.amount_received),currency:String(object.currency||'').toLowerCase()});
     if(result?.duplicate)return sendJson(res,200,{received:true,duplicate:true});
     if(result?.missing||result?.mismatch||result?.accountMismatch)return sendJson(res,422,{error:{code:'payment_reconciliation_failed',message:'Payment ownership, amount, or currency did not reconcile.'}});
     const receipt=await sendPaymentReceipt(repos,ownership.tenantId,result);
     return sendJson(res,200,{received:true,receiptStatus:receipt.status});
   }
   if(event.type==='payment_intent.payment_failed'||event.type==='payment_intent.canceled'){
     const result=await repos.payments.failStripePayment(ownership.tenantId,{eventId:event.id,eventType:event.type,paymentIntentId:object.id,failureReason:object.last_payment_error?.message||object.cancellation_reason||event.type});
     if(result?.missing)return sendJson(res,422,{error:{code:'payment_reconciliation_failed',message:'Failed payment is not recognized.'}});
     return sendJson(res,200,{received:true,duplicate:Boolean(result?.duplicate)});
   }
   if(event.type==='charge.refunded'){
     const paymentIntentId=typeof object.payment_intent==='string'?object.payment_intent:object.payment_intent?.id||'';
     const payment=await repos.payments.findByStripeIntent(ownership.tenantId,paymentIntentId);
     if(!payment)return sendJson(res,422,{error:{code:'refund_payment_not_found',message:'Refunded payment is not recognized.'}});
     const refunds=object.refunds?.data||[],latest=refunds[refunds.length-1]||{};
     const totalRefunded=Number(object.amount_refunded||0),alreadyRefunded=Number(payment.refundedAmountCents||0),delta=totalRefunded-alreadyRefunded;
     if(delta<=0)return sendJson(res,200,{received:true,duplicate:true});
     const result=await repos.payments.applyRefund(ownership.tenantId,payment.id,{eventId:event.id,paymentIntentId,amountCents:delta,stripeRefundId:latest.id||'',reason:latest.reason||''});
     return sendJson(res,200,{received:true,duplicate:Boolean(result?.duplicate)});
   }
   if(['charge.dispute.created','charge.dispute.closed'].includes(event.type)){
     const status=String(object.status||''),eventType=event.type==='charge.dispute.created'?'dispute_opened':status==='won'?'dispute_won':'dispute_lost';
     const result=await repos.payments.recordDispute(ownership.tenantId,{eventId:event.id,eventType,chargeId:typeof object.charge==='string'?object.charge:object.charge?.id||'',paymentIntentId:object.payment_intent||'',disputeId:object.id,amountCents:Number(object.amount||0),currency:String(object.currency||'').toLowerCase(),status});
     return sendJson(res,200,{received:true,duplicate:Boolean(result?.duplicate)});
   }
   return sendJson(res,200,{received:true,ignored:true});
 }).catch(err=>sendJson(res,err.status||500,{error:{code:err.code||'webhook_processing_failed',message:err.message}}));
}
module.exports={platform,connect};
