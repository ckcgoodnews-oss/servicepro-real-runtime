const fs = require('fs');

const required = [
  'apps/api/src/services/partnerService.js',
  'apps/api/src/repositories/partnerRepository.js',
  'apps/api/src/routes/partner.js',
  'scripts/seed-partner-reseller.js',
  'packages/database/postgres/107_partner_reseller_runtime.sql',
  'docs/sprint107-partner-reseller-runtime.md'
];

for (const file of required) {
  if (!fs.existsSync(file)) {
    console.error(`Missing required Sprint 107 patch file: ${file}`);
    process.exit(1);
  }
}

const {
  normalizePartnerAccountInput,
  normalizeResellerTenantInput,
  normalizeReferralInput,
  normalizeCommissionRuleInput,
  acceptReferral,
  markReferralWon,
  calculateCommission,
  normalizeCommissionLedgerInput,
  approveCommission,
  normalizePayoutBatchInput,
  approvePayoutBatch,
  markPayoutPaid,
  summarizePartnerPerformance
} = require('../apps/api/src/services/partnerService');

const partner = { id: 'partner1', ...normalizePartnerAccountInput({ name: 'Blue Ridge Consulting', partnerType: 'reseller' }) };
if (partner.code !== 'BLUE-RIDGE-CONSULTING' || partner.partnerType !== 'reseller') process.exit(1);

const resellerTenant = normalizeResellerTenantInput({ partnerId: partner.id, tenantId: 'tenant_demo' });
if (resellerTenant.status !== 'active') process.exit(1);

let referral = normalizeReferralInput({ partnerId: partner.id, prospectName: 'Acme Mechanical' });
referral = acceptReferral(referral);
referral = markReferralWon(referral, 'tenant_acme');
if (referral.status !== 'won' || referral.wonTenantId !== 'tenant_acme') process.exit(1);

const rule = { id: 'rule1', ...normalizeCommissionRuleInput({ partnerId: partner.id, name: '20 percent', percentageBps: 2000 }) };
if (calculateCommission({ rule, baseAmountCents: 50000 }) !== 10000) process.exit(1);

let commission = normalizeCommissionLedgerInput({ partnerId: partner.id, amountCents: 10000 });
commission = approveCommission(commission, 'owner');
if (commission.status !== 'approved') process.exit(1);

let payout = normalizePayoutBatchInput({ partnerId: partner.id, commissionLedgerIds: ['comm1'], totalAmountCents: 10000 });
payout = approvePayoutBatch(payout, 'owner');
payout = markPayoutPaid(payout);
if (payout.status !== 'paid') process.exit(1);

const summary = summarizePartnerPerformance({
  referrals: [referral],
  commissions: [commission, { ...commission, status: 'paid' }],
  resellerTenants: [resellerTenant]
});
if (summary.referralsWon !== 1 || summary.activeResellerTenants !== 1 || summary.approvedCommissionCents !== 20000) process.exit(1);

console.log('Sprint 107 partner reseller runtime patch test passed.');
