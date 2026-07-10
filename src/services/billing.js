const store = require('../db');
const { v4: uuid } = require('uuid');
const now = () => new Date().toISOString();

const plans = {
  starter: { name: 'Starter', monthly_cents: 4900, max_users: 3, max_active_jobs: 100, features: ['customers','jobs','pricing'] },
  growth: { name: 'Growth', monthly_cents: 9900, max_users: 12, max_active_jobs: 500, features: ['customers','jobs','pricing','dispatch','estimates','invoices','portal'] },
  pro: { name: 'Pro', monthly_cents: 19900, max_users: 50, max_active_jobs: 2500, features: ['all'] }
};

async function getTenantSubscription(tenantId) {
  let sub = await store.findOne('subscriptions', s => s.tenant_id === tenantId);
  if (!sub) {
    sub = { id: uuid(), tenant_id: tenantId, plan_code: 'starter', status: 'trialing', stripe_customer_id: '', stripe_subscription_id: '', current_period_end: '', created_at: now(), updated_at: now() };
    await store.insert('subscriptions', sub);
  }
  return { ...sub, plan: plans[sub.plan_code] || plans.starter };
}

async function setTenantPlan(tenantId, plan_code, status='active') {
  const existing = await store.findOne('subscriptions', s => s.tenant_id === tenantId);
  if (existing) {
    await store.update('subscriptions', s => s.tenant_id === tenantId, { plan_code, status, updated_at: now() });
    return getTenantSubscription(tenantId);
  }
  await store.insert('subscriptions', { id: uuid(), tenant_id: tenantId, plan_code, status, stripe_customer_id: '', stripe_subscription_id: '', current_period_end: '', created_at: now(), updated_at: now() });
  return getTenantSubscription(tenantId);
}

async function planUsage(tenantId) {
  const users = (await store.table('users')).filter(u => u.tenant_id === tenantId && u.active !== false).length;
  const jobs = (await store.table('jobs')).filter(j => j.tenant_id === tenantId && !['completed','cancelled'].includes(j.status)).length;
  return { users, active_jobs: jobs };
}

function stripeConfigured() { return Boolean(process.env.STRIPE_SECRET_KEY && process.env.STRIPE_PRICE_STARTER); }

async function createCheckoutStub(req, tenantId, plan_code) {
  const id = uuid();
  const url = stripeConfigured() ? `${req.protocol}://${req.get('host')}/admin/billing/checkout/stub/${id}` : '';
  await store.insert('billing_events', { id, tenant_id: tenantId, event_type: 'checkout_requested', plan_code, status: stripeConfigured() ? 'created_stub' : 'not_configured', metadata: JSON.stringify({ url }), created_at: now() });
  return { id, url, configured: stripeConfigured() };
}

module.exports = { plans, getTenantSubscription, setTenantPlan, planUsage, createCheckoutStub, stripeConfigured };
