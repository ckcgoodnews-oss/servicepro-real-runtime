const svc=require('../apps/api/src/services/phase33Version5GaService');
const row=svc.normalizeRecord({tenantId:'tenant_demo',domain:'tenant-v5-migration-dry-runs',name:'Tenant V5 Migration Dry Runs'});
if(row.domain!=='tenant-v5-migration-dry-runs'||row.status!=='draft')process.exit(1);
const passed=svc.transitionRecord(row,'pass');
if(passed.status!=='passed')process.exit(1);
const summary=svc.metrics([passed]);
if(summary.total!==1||summary.passed!==1||summary.byDomain['tenant-v5-migration-dry-runs']!==1)process.exit(1);
console.log('Sprint 525 Tenant V5 Migration Dry Runs test passed.');
