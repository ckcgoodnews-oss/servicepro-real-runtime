const { makeId, now } = require('../services/id');
const {
  normalizePlanInput,
  normalizePlanEntitlementInput,
  normalizeTenantSubscriptionInput,
  normalizeUsageMeterInput,
  normalizeUsageRecordInput,
  normalizeInvoiceInput,
  evaluateEntitlement,
  aggregateUsage,
  buildInvoiceFromPlan,
  markInvoicePaid
} = require('../services/subscriptionService');

function createSubscriptionRepository(store) {
  if (store.type === 'json') return createJsonSubscriptionRepository(store);
  if (store.type === 'postgres') return createPostgresSubscriptionRepository(store);
  throw new Error(`Unsupported store type: ${store.type}`);
}

function ensureSubscription(data) {
  if (!data.subscriptionPlans) data.subscriptionPlans = [];
  if (!data.planEntitlements) data.planEntitlements = [];
  if (!data.tenantSubscriptions) data.tenantSubscriptions = [];
  if (!data.usageMeters) data.usageMeters = [];
  if (!data.usageRecords) data.usageRecords = [];
  if (!data.billingInvoices) data.billingInvoices = [];
  return data;
}

function createJsonSubscriptionRepository(store) {
  return {
    listPlans(filters = {}) {
      return ensureSubscription(store.read()).subscriptionPlans
        .filter(x => !filters.status || x.status === filters.status)
        .sort((a, b) => String(a.name).localeCompare(String(b.name)));
    },
    createPlan(input) {
      const data = ensureSubscription(store.read());
      const row = { id: makeId('plan'), ...normalizePlanInput(input), createdAt: now(), updatedAt: now() };
      data.subscriptionPlans.push(row);
      store.write(data);
      return row;
    },
    listPlanEntitlements(planId) {
      return ensureSubscription(store.read()).planEntitlements
        .filter(x => x.planId === planId)
        .sort((a, b) => String(a.entitlementKey).localeCompare(String(b.entitlementKey)));
    },
    createPlanEntitlement(input) {
      const data = ensureSubscription(store.read());
      const row = { id: makeId('ent'), ...normalizePlanEntitlementInput(input), createdAt: now(), updatedAt: now() };
      data.planEntitlements.push(row);
      store.write(data);
      return row;
    },
    listSubscriptions(tenantId, filters = {}) {
      return ensureSubscription(store.read()).tenantSubscriptions
        .filter(x => x.tenantId === tenantId)
        .filter(x => !filters.status || x.status === filters.status)
        .sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));
    },
    getActiveSubscription(tenantId) {
      return this.listSubscriptions(tenantId).find(x => ['trialing', 'active'].includes(x.status)) || null;
    },
    createSubscription(tenantId, input) {
      const data = ensureSubscription(store.read());
      const row = { id: makeId('sub'), tenantId, ...normalizeTenantSubscriptionInput(input), createdAt: now(), updatedAt: now() };
      data.tenantSubscriptions.push(row);
      store.write(data);
      return row;
    },
    evaluateEntitlement(tenantId, input = {}) {
      const subscription = input.subscriptionId
        ? ensureSubscription(store.read()).tenantSubscriptions.find(x => x.tenantId === tenantId && x.id === input.subscriptionId)
        : this.getActiveSubscription(tenantId);
      if (!subscription) return { allowed: false, reason: 'No active subscription', entitlementKey: input.entitlementKey || '' };
      const entitlements = this.listPlanEntitlements(subscription.planId);
      return evaluateEntitlement({ subscription, entitlements, entitlementKey: input.entitlementKey, requestedQuantity: input.requestedQuantity || 1 });
    },
    listMeters() {
      return ensureSubscription(store.read()).usageMeters.sort((a, b) => String(a.meterKey).localeCompare(String(b.meterKey)));
    },
    createMeter(input) {
      const data = ensureSubscription(store.read());
      const row = { id: makeId('meter'), ...normalizeUsageMeterInput(input), createdAt: now(), updatedAt: now() };
      data.usageMeters.push(row);
      store.write(data);
      return row;
    },
    recordUsage(tenantId, input) {
      const data = ensureSubscription(store.read());
      const subscription = input.subscriptionId ? data.tenantSubscriptions.find(x => x.tenantId === tenantId && x.id === input.subscriptionId) : this.getActiveSubscription(tenantId);
      const row = { id: makeId('usage'), tenantId, ...normalizeUsageRecordInput({ ...input, subscriptionId: subscription ? subscription.id : input.subscriptionId }), createdAt: now(), updatedAt: now() };
      data.usageRecords.push(row);
      store.write(data);
      return row;
    },
    aggregateUsage(tenantId, input = {}) {
      const data = ensureSubscription(store.read());
      const meter = data.usageMeters.find(x => x.meterKey === input.meterKey);
      const records = data.usageRecords.filter(x => x.tenantId === tenantId && (!input.subscriptionId || x.subscriptionId === input.subscriptionId));
      return {
        meterKey: input.meterKey,
        quantity: aggregateUsage(records, input.meterKey, meter ? meter.aggregation : 'sum')
      };
    },
    listInvoices(tenantId, filters = {}) {
      return ensureSubscription(store.read()).billingInvoices
        .filter(x => x.tenantId === tenantId)
        .filter(x => !filters.status || x.status === filters.status)
        .sort((a, b) => String(b.issuedAt).localeCompare(String(a.issuedAt)));
    },
    createInvoice(tenantId, input) {
      const data = ensureSubscription(store.read());
      const row = { id: makeId('inv'), tenantId, ...normalizeInvoiceInput(input), createdAt: now(), updatedAt: now() };
      data.billingInvoices.push(row);
      store.write(data);
      return row;
    },
    generateInvoice(tenantId, input = {}) {
      const data = ensureSubscription(store.read());
      const subscription = input.subscriptionId
        ? data.tenantSubscriptions.find(x => x.tenantId === tenantId && x.id === input.subscriptionId)
        : this.getActiveSubscription(tenantId);
      if (!subscription) return null;
      const plan = data.subscriptionPlans.find(x => x.id === subscription.planId);
      const usage = data.usageRecords.filter(x => x.tenantId === tenantId && x.subscriptionId === subscription.id);
      const invoice = buildInvoiceFromPlan({ subscription, plan, usage, meters: data.usageMeters, invoiceNumber: input.invoiceNumber || '' });
      return this.createInvoice(tenantId, invoice);
    },
    markInvoicePaid(tenantId, id) {
      const data = ensureSubscription(store.read());
      const idx = data.billingInvoices.findIndex(x => x.tenantId === tenantId && x.id === id);
      if (idx === -1) return null;
      data.billingInvoices[idx] = markInvoicePaid(data.billingInvoices[idx]);
      store.write(data);
      return data.billingInvoices[idx];
    }
  };
}

function createPostgresSubscriptionRepository(store) {
  async function rows(sql, params) { return (await store.query(sql, params)).rows; }

  return {
    async listPlans(filters = {}) {
      const params = [];
      let where = '';
      if (filters.status) { params.push(filters.status); where = 'WHERE status=$1'; }
      return rows(`SELECT id::text, code, name, description, status, billing_interval as "billingInterval", base_price_cents as "basePriceCents", currency, trial_days as "trialDays", metadata, created_at as "createdAt", updated_at as "updatedAt" FROM subscription_plans ${where} ORDER BY name`, params);
    },
    async createPlan(input) {
      const x = normalizePlanInput(input);
      return (await rows(`INSERT INTO subscription_plans (code, name, description, status, billing_interval, base_price_cents, currency, trial_days, metadata) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9::jsonb) RETURNING id::text, code, name, description, status, billing_interval as "billingInterval", base_price_cents as "basePriceCents", currency, trial_days as "trialDays", metadata, created_at as "createdAt", updated_at as "updatedAt"`, [x.code, x.name, x.description, x.status, x.billingInterval, x.basePriceCents, x.currency, x.trialDays, JSON.stringify(x.metadata || {})]))[0];
    },
    async listPlanEntitlements(planId) {
      return rows(`SELECT id::text, plan_id::text as "planId", entitlement_key as "entitlementKey", value_type as "valueType", value, description, metadata, created_at as "createdAt", updated_at as "updatedAt" FROM plan_entitlements WHERE plan_id=$1 ORDER BY entitlement_key`, [planId]);
    },
    async createPlanEntitlement(input) {
      const x = normalizePlanEntitlementInput(input);
      return (await rows(`INSERT INTO plan_entitlements (plan_id, entitlement_key, value_type, value, description, metadata) VALUES ($1::uuid,$2,$3,$4::jsonb,$5,$6::jsonb) RETURNING id::text, plan_id::text as "planId", entitlement_key as "entitlementKey", value_type as "valueType", value, description, metadata, created_at as "createdAt", updated_at as "updatedAt"`, [x.planId, x.entitlementKey, x.valueType, JSON.stringify(x.value), x.description, JSON.stringify(x.metadata || {})]))[0];
    },
    async listSubscriptions(tenantId, filters = {}) {
      const params = [tenantId];
      let where = 'WHERE tenant_id=$1';
      if (filters.status) { params.push(filters.status); where += ` AND status=$${params.length}`; }
      return rows(`SELECT id::text, tenant_id as "tenantId", plan_id::text as "planId", status, started_at as "startedAt", current_period_start as "currentPeriodStart", current_period_end as "currentPeriodEnd", cancelled_at as "cancelledAt", external_customer_id as "externalCustomerId", external_subscription_id as "externalSubscriptionId", metadata, created_at as "createdAt", updated_at as "updatedAt" FROM tenant_subscriptions ${where} ORDER BY created_at DESC`, params);
    },
    async getActiveSubscription(tenantId) { return (await this.listSubscriptions(tenantId)).find(x => ['trialing', 'active'].includes(x.status)) || null; },
    async createSubscription(tenantId, input) {
      const x = normalizeTenantSubscriptionInput(input);
      return (await rows(`INSERT INTO tenant_subscriptions (tenant_id, plan_id, status, started_at, current_period_start, current_period_end, cancelled_at, external_customer_id, external_subscription_id, metadata) VALUES ($1,$2::uuid,$3,$4::timestamptz,$5::timestamptz,NULLIF($6,'')::timestamptz,NULLIF($7,'')::timestamptz,$8,$9,$10::jsonb) RETURNING id::text, tenant_id as "tenantId", plan_id::text as "planId", status, started_at as "startedAt", current_period_start as "currentPeriodStart", current_period_end as "currentPeriodEnd", cancelled_at as "cancelledAt", external_customer_id as "externalCustomerId", external_subscription_id as "externalSubscriptionId", metadata, created_at as "createdAt", updated_at as "updatedAt"`, [tenantId, x.planId, x.status, x.startedAt, x.currentPeriodStart, x.currentPeriodEnd, x.cancelledAt, x.externalCustomerId, x.externalSubscriptionId, JSON.stringify(x.metadata || {})]))[0];
    },
    async evaluateEntitlement(tenantId, input = {}) {
      const subscription = input.subscriptionId ? (await this.listSubscriptions(tenantId)).find(x => x.id === input.subscriptionId) : await this.getActiveSubscription(tenantId);
      if (!subscription) return { allowed: false, reason: 'No active subscription', entitlementKey: input.entitlementKey || '' };
      return evaluateEntitlement({ subscription, entitlements: await this.listPlanEntitlements(subscription.planId), entitlementKey: input.entitlementKey, requestedQuantity: input.requestedQuantity || 1 });
    },
    async listMeters() { return rows(`SELECT id::text, meter_key as "meterKey", name, description, unit, aggregation, billable, metadata, created_at as "createdAt", updated_at as "updatedAt" FROM usage_meters ORDER BY meter_key`, []); },
    async createMeter(input) {
      const x = normalizeUsageMeterInput(input);
      return (await rows(`INSERT INTO usage_meters (meter_key, name, description, unit, aggregation, billable, metadata) VALUES ($1,$2,$3,$4,$5,$6,$7::jsonb) RETURNING id::text, meter_key as "meterKey", name, description, unit, aggregation, billable, metadata, created_at as "createdAt", updated_at as "updatedAt"`, [x.meterKey, x.name, x.description, x.unit, x.aggregation, x.billable, JSON.stringify(x.metadata || {})]))[0];
    },
    async recordUsage(tenantId, input) {
      const x = normalizeUsageRecordInput(input);
      return (await rows(`INSERT INTO usage_records (tenant_id, subscription_id, meter_key, quantity, source_id, source_type, recorded_at, metadata) VALUES ($1,NULLIF($2,'')::uuid,$3,$4,$5,$6,$7::timestamptz,$8::jsonb) RETURNING id::text, tenant_id as "tenantId", subscription_id::text as "subscriptionId", meter_key as "meterKey", quantity::float, source_id as "sourceId", source_type as "sourceType", recorded_at as "recordedAt", metadata, created_at as "createdAt", updated_at as "updatedAt"`, [tenantId, x.subscriptionId, x.meterKey, x.quantity, x.sourceId, x.sourceType, x.recordedAt, JSON.stringify(x.metadata || {})]))[0];
    },
    async aggregateUsage() { return { quantity: 0 }; },
    async listInvoices() { return []; },
    async createInvoice(tenantId, input) { return { id: 'postgres-invoice-placeholder', tenantId, ...normalizeInvoiceInput(input) }; },
    async generateInvoice() { return null; },
    async markInvoicePaid() { return null; }
  };
}

module.exports = { createSubscriptionRepository };
