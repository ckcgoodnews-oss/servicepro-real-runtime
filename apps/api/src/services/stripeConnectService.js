const { stripeRequest } = require('./paymentService');

function requireHttpsUrl(value, name) {
  let url;
  try { url = new URL(String(value || '')); } catch { throw Object.assign(new Error(`${name} must be a valid HTTPS URL.`), { code: 'validation_failed', status: 400 }); }
  if (url.protocol !== 'https:' && process.env.NODE_ENV === 'production') throw Object.assign(new Error(`${name} must use HTTPS.`), { code: 'validation_failed', status: 400 });
  const allowed = String(process.env.STRIPE_CONNECT_RETURN_ORIGINS || process.env.CORS_ALLOWED_ORIGINS || '').split(',').map(x=>x.trim()).filter(Boolean);
  if (allowed.length && !allowed.includes(url.origin)) throw Object.assign(new Error(`${name} origin is not allowed.`), { code: 'validation_failed', status: 400 });
  return url.toString();
}

function deriveStatus(account) {
  if (account.charges_enabled && account.payouts_enabled) return account.requirements?.eventually_due?.length ? 'restricted_soon' : 'active';
  if (account.requirements?.disabled_reason) return 'disabled';
  if (account.details_submitted) return 'restricted';
  return 'onboarding';
}

async function createExpressAccount(tenantId, email='') {
  const body=new URLSearchParams({type:'express','metadata[servicepro_tenant_id]':tenantId});
  if(email)body.set('email',email);
  return stripeRequest('/v1/accounts',{method:'POST',body,idempotencyKey:`connect-account:${tenantId}`});
}
async function createAccountLink(accountId, returnUrl, refreshUrl) {
  return stripeRequest('/v1/account_links',{method:'POST',body:new URLSearchParams({account:accountId,type:'account_onboarding',return_url:requireHttpsUrl(returnUrl,'returnUrl'),refresh_url:requireHttpsUrl(refreshUrl,'refreshUrl')})});
}
async function createDashboardLink(accountId) { return stripeRequest(`/v1/accounts/${encodeURIComponent(accountId)}/login_links`,{method:'POST'}); }
function accountRecord(account){return{stripeAccountId:account.id,status:deriveStatus(account),chargesEnabled:Boolean(account.charges_enabled),payoutsEnabled:Boolean(account.payouts_enabled),detailsSubmitted:Boolean(account.details_submitted),country:account.country||'',defaultCurrency:account.default_currency||'usd',businessType:account.business_type||'',metadata:{requirements:account.requirements?.currently_due||[]}};}

module.exports={createExpressAccount,createAccountLink,createDashboardLink,accountRecord,deriveStatus,requireHttpsUrl};
