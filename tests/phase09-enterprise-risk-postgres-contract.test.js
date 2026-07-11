const assert = require('assert');
const { createEnterpriseRiskRepository } = require('../apps/api/src/repositories/enterpriseRiskRepository');

const calls = [];
const responses = [];
const store = {
  type: 'postgres',
  async query(sql, params) {
    calls.push({ sql: sql.replace(/\s+/g, ' ').trim(), params });
    return responses.shift() || { rows: [], rowCount: 0 };
  }
};
const repository = createEnterpriseRiskRepository(store);

(async () => {
  responses.push({ rows: [{ id: '00000000-0000-4000-8000-000000000001' }], rowCount: 1 });
  responses.push({ rows: [{ id: '00000000-0000-4000-8000-000000000001', tenantId: 'tenant-a' }], rowCount: 1 });
  await repository.createRisk({ tenantId: 'tenant-a', code: 'R-1', title: 'Outage', category: 'operational', owner: 'cto' });
  assert.match(calls[0].sql, /INSERT INTO enterprise_risks/);
  assert.strictEqual(calls[0].params[0], 'tenant-a');
  assert.match(calls[1].sql, /WHERE tenant_id=\$1 AND id=\$2::uuid/);

  responses.push({ rows: [], rowCount: 0 });
  assert.strictEqual(await repository.assessRisk('tenant-b', '00000000-0000-4000-8000-000000000001', 5, 5), null);
  assert.match(calls[2].sql, /WHERE tenant_id=\$1 AND id=\$2::uuid/);
  assert.deepStrictEqual(calls[2].params.slice(0, 2), ['tenant-b', '00000000-0000-4000-8000-000000000001']);

  responses.push({ rows: [], rowCount: 0 });
  assert.strictEqual(await repository.createKri({ tenantId: 'tenant-b', riskId: '00000000-0000-4000-8000-000000000001', name: 'Downtime', threshold: 5 }), null);
  assert.match(calls[3].sql, /FROM enterprise_risks r WHERE r\.tenant_id=\$1 AND r\.id=\$2::uuid/);

  responses.push({ rows: [], rowCount: 0 });
  assert.strictEqual(await repository.createTreatment({ tenantId: 'tenant-b', riskId: '00000000-0000-4000-8000-000000000001', owner: 'cto', response: 'mitigate', plan: 'HA' }), null);
  assert.match(calls[4].sql, /WHERE r\.tenant_id=\$1 AND r\.id=\$2::uuid/);

  responses.push({ rows: [], rowCount: 0 });
  assert.strictEqual(await repository.completeTreatment('tenant-b', '00000000-0000-4000-8000-000000000002', []), null);
  assert.match(calls[5].sql, /WHERE tenant_id=\$1 AND id=\$2::uuid/);

  console.log('Phase 9 enterprise risk PostgreSQL contract test passed.');
})().catch(error => { console.error(error); process.exit(1); });
