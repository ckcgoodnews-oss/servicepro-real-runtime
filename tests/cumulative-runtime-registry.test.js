const { listRepositoryRegistrations } = require('../apps/api/src/repositories/repositoryFactory');
const { PERMISSIONS, ROLE_PRESETS } = require('../apps/api/src/auth/permissions');

const registrations = listRepositoryRegistrations();
if (registrations.length < 90) throw new Error(`Expected at least 90 repositories, found ${registrations.length}`);
const keys = new Set(registrations.map(row => row.key));
for (const key of ['customers', 'jobs', 'privacyDsarOps', 'privacyCaseOrchestration', 'financeRevenueOps']) {
  if (!keys.has(key)) throw new Error(`Missing cumulative repository registration: ${key}`);
}
if (Object.keys(PERMISSIONS).length < 40) throw new Error('Cumulative permission discovery is incomplete');
if (ROLE_PRESETS.owner.length !== Object.keys(PERMISSIONS).length) throw new Error('Owner role must include every permission');
console.log(`Cumulative registry passed: ${registrations.length} repositories, ${Object.keys(PERMISSIONS).length} permissions.`);
