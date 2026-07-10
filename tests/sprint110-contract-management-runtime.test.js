const fs = require('fs');

const required = [
  'apps/api/src/services/contractService.js',
  'apps/api/src/repositories/contractRepository.js',
  'apps/api/src/routes/contracts.js',
  'scripts/seed-contract-management.js',
  'packages/database/postgres/110_contract_management_runtime.sql',
  'docs/sprint110-contract-management-runtime.md'
];

for (const file of required) {
  if (!fs.existsSync(file)) {
    console.error(`Missing required Sprint 110 patch file: ${file}`);
    process.exit(1);
  }
}

const {
  normalizeAgreementInput,
  normalizeOrderFormInput,
  normalizeContractTermInput,
  normalizeAmendmentInput,
  normalizeObligationInput,
  activateAgreement,
  terminateAgreement,
  executeAmendment,
  fulfillObligation,
  calculateOrderFormTotal,
  evaluateRenewalWindow,
  summarizeContractPortfolio,
  daysUntil
} = require('../apps/api/src/services/contractService');

let agreement = normalizeAgreementInput({
  tenantId: 'tenant_demo',
  name: 'Master Services Agreement',
  endDate: '2027-07-31',
  renewalType: 'auto_renew',
  noticeDays: 60,
  totalContractValueCents: 1200000
});
if (agreement.code !== 'MASTER-SERVICES-AGREEMENT') process.exit(1);

agreement = activateAgreement(agreement);
if (agreement.status !== 'active') process.exit(1);

const orderForm = normalizeOrderFormInput({
  agreementId: 'agreement1',
  name: 'Enterprise Order Form',
  amountCents: 1200000,
  status: 'active'
});
if (calculateOrderFormTotal([orderForm]) !== 1200000) process.exit(1);

const term = normalizeContractTermInput({
  agreementId: 'agreement1',
  title: 'Support',
  termType: 'support'
});
if (term.termType !== 'support') process.exit(1);

let amendment = normalizeAmendmentInput({
  agreementId: 'agreement1',
  title: 'Security Addendum',
  status: 'pending_signature'
});
amendment = executeAmendment(amendment);
if (amendment.status !== 'executed') process.exit(1);

let obligation = normalizeObligationInput({
  agreementId: 'agreement1',
  title: 'Annual review',
  dueDate: '2027-01-31'
});
obligation = fulfillObligation(obligation, 'https://example.com/evidence');
if (obligation.status !== 'fulfilled' || !obligation.evidenceUrl) process.exit(1);

const renewal = evaluateRenewalWindow({ agreement, asOf: '2027-06-15' });
if (!renewal.inRenewalWindow || renewal.daysToEnd !== 46) process.exit(1);

if (daysUntil('2027-07-31', '2027-07-01') !== 30) process.exit(1);

const portfolio = summarizeContractPortfolio([agreement], [obligation, { ...obligation, status: 'breached' }]);
if (portfolio.totalAgreements !== 1 || portfolio.activeAgreements !== 1 || portfolio.breachedObligations !== 1) process.exit(1);

agreement = terminateAgreement(agreement);
if (agreement.status !== 'terminated') process.exit(1);

console.log('Sprint 110 contract management runtime patch test passed.');
