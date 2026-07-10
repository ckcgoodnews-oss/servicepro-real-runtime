const fs = require('fs');

const required = [
  'apps/api/src/services/agreementService.js',
  'apps/api/src/repositories/serviceAgreementRepository.js',
  'apps/api/src/repositories/agreementVisitRepository.js',
  'apps/api/src/routes/serviceAgreements.js',
  'packages/database/postgres/076_service_agreements_runtime.sql',
  'docs/sprint76-service-agreements-runtime.md'
];

for (const file of required) {
  if (!fs.existsSync(file)) {
    console.error(`Missing required Sprint 76 patch file: ${file}`);
    process.exit(1);
  }
}

process.env.DATA_STORE = 'json';
process.env.DATA_FILE = './data/test-sprint76.json';
process.env.JWT_SECRET = 'test-secret-for-sprint-76';

const { calculateNextVisitDate, calculateRenewalDate, agreementStatus } = require('../apps/api/src/services/agreementService');

if (calculateNextVisitDate('2026-01-01', 'quarterly', 0) !== '2026-04-01') {
  console.error('Next quarterly visit calculation failed.');
  process.exit(1);
}
if (calculateRenewalDate('2026-01-01', 12) !== '2027-01-01') {
  console.error('Renewal date calculation failed.');
  process.exit(1);
}
if (agreementStatus({ status: 'active', endDate: '2025-01-01' }, '2026-01-01') !== 'expired') {
  console.error('Agreement status calculation failed.');
  process.exit(1);
}

console.log('Sprint 76 service agreements runtime patch test passed.');
