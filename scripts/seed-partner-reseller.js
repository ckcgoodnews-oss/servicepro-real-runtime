const { getRepositories, resetRepositoriesForTest } = require('../apps/api/src/repositories/repositoryFactory');

async function main() {
  resetRepositoriesForTest();
  const repos = getRepositories();

  const partner = await repos.partners.createPartner({
    name: 'Blue Ridge Consulting',
    partnerType: 'reseller',
    primaryContactName: 'Jordan Smith',
    primaryContactEmail: 'jordan@example.com',
    companyUrl: 'https://example.com'
  });

  const resellerTenant = await repos.partners.createResellerTenant({
    partnerId: partner.id,
    tenantId: 'tenant_demo',
    accountManager: 'Jordan Smith'
  });

  const referral = await repos.partners.createReferral({
    partnerId: partner.id,
    prospectName: 'Acme Mechanical',
    prospectEmail: 'owner@acme.example',
    estimatedValueCents: 1200000
  });

  const wonReferral = await repos.partners.markReferralWon(referral.id, 'tenant_acme');

  const rule = await repos.partners.createCommissionRule({
    partnerId: partner.id,
    name: 'Standard 20 percent first year',
    commissionType: 'percentage',
    percentageBps: 2000
  });

  const commission = await repos.partners.createCommissionFromRule({
    commissionRuleId: rule.id,
    partnerId: partner.id,
    tenantId: 'tenant_acme',
    referralId: wonReferral.id,
    sourceType: 'subscription_invoice',
    sourceId: 'inv_demo',
    baseAmountCents: 49900
  });

  const approvedCommission = await repos.partners.approveCommission(commission.id, 'owner');

  const payout = await repos.partners.createPayoutBatch({
    partnerId: partner.id,
    commissionLedgerIds: [approvedCommission.id],
    createdBy: 'owner'
  });

  const performance = await repos.partners.performance(partner.id);

  if (repos.store.close) await repos.store.close();
  console.log(JSON.stringify({ ok: true, partner, resellerTenant, referral: wonReferral, rule, commission: approvedCommission, payout, performance }, null, 2));
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
