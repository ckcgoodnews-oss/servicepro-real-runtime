const { getRepositories, resetRepositoriesForTest } = require('../apps/api/src/repositories/repositoryFactory');

async function main() {
  resetRepositoriesForTest();
  const repos = getRepositories();
  const tenantId = process.env.DEFAULT_TENANT_ID || 'tenant_demo';

  const agreement = await repos.contracts.createAgreement({
    tenantId,
    name: 'Demo Field Service Master Services Agreement',
    counterpartyName: 'Demo Field Service Co.',
    owner: 'Legal Operations',
    status: 'draft',
    effectiveDate: '2026-07-07',
    startDate: '2026-08-01',
    endDate: '2027-07-31',
    renewalType: 'auto_renew',
    noticeDays: 60,
    totalContractValueCents: 1200000
  });

  const activeAgreement = await repos.contracts.activateAgreement(agreement.id);

  const orderForm = await repos.contracts.createOrderForm({
    agreementId: agreement.id,
    name: 'Enterprise Platform Order Form',
    status: 'active',
    startDate: '2026-08-01',
    endDate: '2027-07-31',
    amountCents: 1200000,
    lineItems: [{ description: 'Enterprise subscription', amountCents: 1200000 }]
  });

  const term = await repos.contracts.createTerm({
    agreementId: agreement.id,
    termType: 'support',
    title: 'Support Coverage',
    body: 'Platform support is provided according to the active support SLA.'
  });

  const amendment = await repos.contracts.createAmendment({
    agreementId: agreement.id,
    title: 'Security Addendum',
    summary: 'Adds enhanced security obligations.',
    status: 'pending_signature'
  });

  const obligation = await repos.contracts.createObligation({
    agreementId: agreement.id,
    title: 'Annual security review',
    owner: 'Security',
    dueDate: '2027-01-31'
  });

  const renewal = await repos.contracts.renewalWindow(agreement.id, '2027-06-15');
  const value = await repos.contracts.value(agreement.id);
  const portfolio = await repos.contracts.portfolio(tenantId);

  if (repos.store.close) await repos.store.close();
  console.log(JSON.stringify({ ok: true, agreement: activeAgreement, orderForm, term, amendment, obligation, renewal, value, portfolio }, null, 2));
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
