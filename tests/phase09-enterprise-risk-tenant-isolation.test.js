const assert = require('assert');
const { createEnterpriseRiskRepository } = require('../apps/api/src/repositories/enterpriseRiskRepository');

let data = {};
const repository = createEnterpriseRiskRepository({
  type: 'json',
  read: () => data,
  write: next => { data = next; }
});

const risk = repository.createRisk({ tenantId: 'tenant-a', code: 'R-1', title: 'Outage', category: 'operational', owner: 'cto' });
assert.strictEqual(repository.assessRisk('tenant-b', risk.id, 5, 5), null);
assert.strictEqual(data.enterpriseRisks[0].residualLikelihood, 1);
assert.ok(repository.assessRisk('tenant-a', risk.id, 3, 4));

const kri = repository.createKri({ tenantId: 'tenant-a', riskId: risk.id, name: 'Downtime', threshold: 5 });
assert.strictEqual(repository.measureKri('tenant-b', kri.id, 10), null);
assert.ok(repository.measureKri('tenant-a', kri.id, 7));

const treatment = repository.createTreatment({ tenantId: 'tenant-a', riskId: risk.id, owner: 'cto', response: 'mitigate', plan: 'HA' });
assert.strictEqual(repository.completeTreatment('tenant-b', treatment.id, ['forged']), null);
assert.ok(repository.completeTreatment('tenant-a', treatment.id, ['tested']));

console.log('Phase 9 enterprise risk tenant-isolation test passed.');
