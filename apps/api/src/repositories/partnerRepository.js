const { makeId, now } = require('../services/id');
const {
  normalizePartnerAccountInput,
  normalizeResellerTenantInput,
  normalizeReferralInput,
  normalizeCommissionRuleInput,
  normalizeCommissionLedgerInput,
  normalizePayoutBatchInput,
  acceptReferral,
  markReferralWon,
  calculateCommission,
  approveCommission,
  approvePayoutBatch,
  markPayoutPaid,
  summarizePartnerPerformance
} = require('../services/partnerService');

function createPartnerRepository(store) {
  if (store.type === 'json') return createJsonPartnerRepository(store);
  if (store.type === 'postgres') return createPostgresPartnerRepository(store);
  throw new Error(`Unsupported store type: ${store.type}`);
}

function ensurePartners(data) {
  if (!data.partnerAccounts) data.partnerAccounts = [];
  if (!data.resellerTenants) data.resellerTenants = [];
  if (!data.partnerReferrals) data.partnerReferrals = [];
  if (!data.commissionRules) data.commissionRules = [];
  if (!data.commissionLedger) data.commissionLedger = [];
  if (!data.payoutBatches) data.payoutBatches = [];
  return data;
}

function createJsonPartnerRepository(store) {
  return {
    listPartners(filters = {}) {
      return ensurePartners(store.read()).partnerAccounts
        .filter(x => !filters.status || x.status === filters.status)
        .filter(x => !filters.partnerType || x.partnerType === filters.partnerType)
        .sort((a, b) => String(a.name).localeCompare(String(b.name)));
    },
    createPartner(input) {
      const data = ensurePartners(store.read());
      const row = { id: makeId('partner'), ...normalizePartnerAccountInput(input), createdAt: now(), updatedAt: now() };
      data.partnerAccounts.push(row);
      store.write(data);
      return row;
    },
    listResellerTenants(partnerId = '') {
      return ensurePartners(store.read()).resellerTenants
        .filter(x => !partnerId || x.partnerId === partnerId)
        .sort((a, b) => String(b.assignedAt).localeCompare(String(a.assignedAt)));
    },
    createResellerTenant(input) {
      const data = ensurePartners(store.read());
      const row = { id: makeId('reseller'), ...normalizeResellerTenantInput(input), createdAt: now(), updatedAt: now() };
      data.resellerTenants.push(row);
      store.write(data);
      return row;
    },
    listReferrals(filters = {}) {
      return ensurePartners(store.read()).partnerReferrals
        .filter(x => !filters.partnerId || x.partnerId === filters.partnerId)
        .filter(x => !filters.status || x.status === filters.status)
        .sort((a, b) => String(b.submittedAt).localeCompare(String(a.submittedAt)));
    },
    createReferral(input) {
      const data = ensurePartners(store.read());
      const row = { id: makeId('ref'), ...normalizeReferralInput(input), createdAt: now(), updatedAt: now() };
      data.partnerReferrals.push(row);
      store.write(data);
      return row;
    },
    acceptReferral(id) {
      const data = ensurePartners(store.read());
      const idx = data.partnerReferrals.findIndex(x => x.id === id);
      if (idx === -1) return null;
      data.partnerReferrals[idx] = acceptReferral(data.partnerReferrals[idx]);
      store.write(data);
      return data.partnerReferrals[idx];
    },
    markReferralWon(id, tenantId) {
      const data = ensurePartners(store.read());
      const idx = data.partnerReferrals.findIndex(x => x.id === id);
      if (idx === -1) return null;
      data.partnerReferrals[idx] = markReferralWon(data.partnerReferrals[idx], tenantId);
      store.write(data);
      return data.partnerReferrals[idx];
    },
    listCommissionRules(partnerId = '') {
      return ensurePartners(store.read()).commissionRules.filter(x => !partnerId || x.partnerId === partnerId);
    },
    createCommissionRule(input) {
      const data = ensurePartners(store.read());
      const row = { id: makeId('comrule'), ...normalizeCommissionRuleInput(input), createdAt: now(), updatedAt: now() };
      data.commissionRules.push(row);
      store.write(data);
      return row;
    },
    createCommissionFromRule(input = {}) {
      const data = ensurePartners(store.read());
      const rule = data.commissionRules.find(x => x.id === input.commissionRuleId);
      const amountCents = calculateCommission({ rule, baseAmountCents: input.baseAmountCents || 0 });
      const row = { id: makeId('comm'), ...normalizeCommissionLedgerInput({ ...input, partnerId: rule ? rule.partnerId : input.partnerId, amountCents }), createdAt: now(), updatedAt: now() };
      data.commissionLedger.push(row);
      store.write(data);
      return row;
    },
    listCommissions(filters = {}) {
      return ensurePartners(store.read()).commissionLedger
        .filter(x => !filters.partnerId || x.partnerId === filters.partnerId)
        .filter(x => !filters.status || x.status === filters.status)
        .sort((a, b) => String(b.earnedAt).localeCompare(String(a.earnedAt)));
    },
    approveCommission(id, approvedBy) {
      const data = ensurePartners(store.read());
      const idx = data.commissionLedger.findIndex(x => x.id === id);
      if (idx === -1) return null;
      data.commissionLedger[idx] = approveCommission(data.commissionLedger[idx], approvedBy);
      store.write(data);
      return data.commissionLedger[idx];
    },
    createPayoutBatch(input = {}) {
      const data = ensurePartners(store.read());
      const ids = Array.isArray(input.commissionLedgerIds) ? input.commissionLedgerIds : [];
      const commissions = data.commissionLedger.filter(x => ids.includes(x.id));
      const totalAmountCents = input.totalAmountCents === undefined ? commissions.reduce((sum, x) => sum + Number(x.amountCents || 0), 0) : input.totalAmountCents;
      const row = { id: makeId('payout'), ...normalizePayoutBatchInput({ ...input, totalAmountCents }), createdAt: now(), updatedAt: now() };
      data.payoutBatches.push(row);
      store.write(data);
      return row;
    },
    approvePayout(id, approvedBy) {
      const data = ensurePartners(store.read());
      const idx = data.payoutBatches.findIndex(x => x.id === id);
      if (idx === -1) return null;
      data.payoutBatches[idx] = approvePayoutBatch(data.payoutBatches[idx], approvedBy);
      store.write(data);
      return data.payoutBatches[idx];
    },
    markPayoutPaid(id) {
      const data = ensurePartners(store.read());
      const idx = data.payoutBatches.findIndex(x => x.id === id);
      if (idx === -1) return null;
      data.payoutBatches[idx] = markPayoutPaid(data.payoutBatches[idx]);
      for (const commissionId of data.payoutBatches[idx].commissionLedgerIds) {
        const cidx = data.commissionLedger.findIndex(x => x.id === commissionId);
        if (cidx !== -1) data.commissionLedger[cidx] = { ...data.commissionLedger[cidx], status: 'paid', paidAt: data.payoutBatches[idx].paidAt, updatedAt: data.payoutBatches[idx].paidAt };
      }
      store.write(data);
      return data.payoutBatches[idx];
    },
    performance(partnerId) {
      const data = ensurePartners(store.read());
      return summarizePartnerPerformance({
        referrals: data.partnerReferrals.filter(x => x.partnerId === partnerId),
        commissions: data.commissionLedger.filter(x => x.partnerId === partnerId),
        resellerTenants: data.resellerTenants.filter(x => x.partnerId === partnerId)
      });
    }
  };
}

function createPostgresPartnerRepository(store) {
  async function rows(sql, params) { return (await store.query(sql, params)).rows; }

  return {
    async listPartners(filters = {}) {
      const params = [];
      let where = '';
      if (filters.status) { params.push(filters.status); where = 'WHERE status=$1'; }
      return rows(`SELECT id::text, code, name, partner_type as "partnerType", status, primary_contact_name as "primaryContactName", primary_contact_email as "primaryContactEmail", company_url as "companyUrl", tax_id_ref as "taxIdRef", payout_method_ref as "payoutMethodRef", metadata, created_at as "createdAt", updated_at as "updatedAt" FROM partner_accounts ${where} ORDER BY name`, params);
    },
    async createPartner(input) {
      const x = normalizePartnerAccountInput(input);
      return (await rows(`INSERT INTO partner_accounts (code, name, partner_type, status, primary_contact_name, primary_contact_email, company_url, tax_id_ref, payout_method_ref, metadata) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10::jsonb) RETURNING id::text, code, name, partner_type as "partnerType", status, primary_contact_name as "primaryContactName", primary_contact_email as "primaryContactEmail", company_url as "companyUrl", tax_id_ref as "taxIdRef", payout_method_ref as "payoutMethodRef", metadata, created_at as "createdAt", updated_at as "updatedAt"`, [x.code, x.name, x.partnerType, x.status, x.primaryContactName, x.primaryContactEmail, x.companyUrl, x.taxIdRef, x.payoutMethodRef, JSON.stringify(x.metadata || {})]))[0];
    },
    async listResellerTenants() { return []; },
    async createResellerTenant(input) { return { id: 'postgres-reseller-placeholder', ...normalizeResellerTenantInput(input) }; },
    async listReferrals() { return []; },
    async createReferral(input) { return { id: 'postgres-referral-placeholder', ...normalizeReferralInput(input) }; },
    async acceptReferral() { return null; },
    async markReferralWon() { return null; },
    async listCommissionRules() { return []; },
    async createCommissionRule(input) { return { id: 'postgres-rule-placeholder', ...normalizeCommissionRuleInput(input) }; },
    async createCommissionFromRule(input) { return { id: 'postgres-commission-placeholder', ...normalizeCommissionLedgerInput(input) }; },
    async listCommissions() { return []; },
    async approveCommission() { return null; },
    async createPayoutBatch(input) { return { id: 'postgres-payout-placeholder', ...normalizePayoutBatchInput(input) }; },
    async approvePayout() { return null; },
    async markPayoutPaid() { return null; },
    async performance() { return summarizePartnerPerformance({}); }
  };
}

module.exports = { createPartnerRepository };
