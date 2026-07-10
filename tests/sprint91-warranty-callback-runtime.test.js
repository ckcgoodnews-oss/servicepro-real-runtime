const fs = require('fs');

const required = [
  'apps/api/src/services/warrantyService.js',
  'apps/api/src/repositories/warrantyRepository.js',
  'apps/api/src/routes/warranty.js',
  'scripts/seed-warranty.js',
  'packages/database/postgres/091_warranty_callback_runtime.sql',
  'docs/sprint91-warranty-callback-runtime.md'
];

for (const file of required) {
  if (!fs.existsSync(file)) {
    console.error(`Missing required Sprint 91 patch file: ${file}`);
    process.exit(1);
  }
}

const {
  normalizeWarrantyPolicyInput,
  normalizeWarrantyClaimInput,
  normalizeCallbackInput,
  evaluateWarrantyEligibility,
  approveClaim,
  denyClaim,
  completeCallback
} = require('../apps/api/src/services/warrantyService');

const policy = { id: 'policy1', ...normalizeWarrantyPolicyInput({ name: '30 Day Warranty', durationDays: 30 }) };
const eligible = evaluateWarrantyEligibility(policy, '2026-07-01', '2026-07-15');
if (!eligible.eligible || eligible.expiresOn !== '2026-07-31') {
  console.error('Warranty eligibility failed.');
  process.exit(1);
}

const expired = evaluateWarrantyEligibility(policy, '2026-07-01', '2026-08-15');
if (expired.eligible) {
  console.error('Warranty expiration failed.');
  process.exit(1);
}

const claim = normalizeWarrantyClaimInput({
  customerId: 'cust1',
  originalJobId: 'job1',
  policyId: 'policy1',
  claimDate: '2026-07-06'
});
const approved = approveClaim(claim, 'owner');
if (approved.status !== 'approved' || !approved.covered) {
  console.error('Claim approval failed.');
  process.exit(1);
}

const denied = denyClaim(claim, 'Not related to original repair');
if (denied.status !== 'denied' || denied.covered) {
  console.error('Claim denial failed.');
  process.exit(1);
}

const callback = normalizeCallbackInput({ customerId: 'cust1', originalJobId: 'job1', reason: 'Same issue returned' });
const done = completeCallback(callback, 'Resolved under warranty');
if (done.status !== 'resolved' || !done.resolvedAt) {
  console.error('Callback completion failed.');
  process.exit(1);
}

console.log('Sprint 91 warranty callback runtime patch test passed.');
