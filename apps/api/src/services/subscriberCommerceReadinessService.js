async function calculateSubscriberCommerceReadiness(repos,tenantId){
 const[tenant,payments,stripe,express,services,events]=await Promise.all([repos.tenantSettings.get(tenantId),repos.subscriberPaymentSettings.get(tenantId),repos.subscriberStripeAccounts.get(tenantId),repos.expressService.getSettings(tenantId),repos.services.list(tenantId),repos.customerPaymentEvents.list(tenantId,{limit:100})]);
 const items=[];const add=(key,label,complete,blocking=true,detail='')=>items.push({key,label,complete:Boolean(complete),blocking:Boolean(blocking),detail});
 add('organization','Organization name configured',tenant.companyName);
 add('branding','Portal branding configured',tenant.branding?.appName||tenant.companyName);
 add('services','At least one active service configured',services.length>0);
 add('invoice_currency','Invoice currency configured',/^[a-z]{3}$/i.test(payments.defaultCurrency||tenant.currency||''));
 add('portal','Customer Portal enabled',tenant.features?.customerPortal!==false,false);
 add('stripe_connected','Stripe connected',!payments.acceptCustomerPayments||Boolean(stripe),payments.acceptCustomerPayments);
 add('stripe_charges','Stripe charges enabled',!payments.acceptCustomerPayments||Boolean(stripe?.chargesEnabled),payments.acceptCustomerPayments);
 add('payment_methods','Supported payment method configured',!payments.acceptCustomerPayments||(payments.acceptedMethods?.length===1&&payments.acceptedMethods[0]==='card'),payments.acceptCustomerPayments);
 add('express_services','Express Service eligible services configured',!express.enabled||express.eligibleServiceIds.length>0,express.enabled);
 add('express_areas','Express Service areas configured',!express.enabled||express.serviceAreaIds.length>0,express.enabled);
 add('test_transaction','Verified test/customer payment recorded',events.some(x=>x.eventType==='payment_succeeded'),false,'Recommended before production enablement.');
 const blockers=items.filter(x=>x.blocking&&!x.complete);return{ready:blockers.length===0,blockers,items,paymentsEnabled:payments.acceptCustomerPayments,expressServiceEnabled:express.enabled,calculatedAt:new Date().toISOString()};
}
module.exports={calculateSubscriberCommerceReadiness};
