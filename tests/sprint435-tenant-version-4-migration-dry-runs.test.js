const svc=require('../apps/api/src/services/phase27Version4GaService');
const row=svc.normalizeRecord({tenantId:'tenant_demo',domain:'tenant-version-4-migration-dry-runs',name:'Tenant Version 4 Migration Dry Runs'});
if(row.domain!=='tenant-version-4-migration-dry-runs'||row.status!=='draft')process.exit(1);
const passed=svc.transitionRecord(row,'pass');
if(passed.status!=='passed')process.exit(1);
const summary=svc.metrics([passed]);
if(summary.total!==1||summary.passed!==1||summary.byDomain['tenant-version-4-migration-dry-runs']!==1)process.exit(1);
console.log('Sprint 435 Tenant Version 4 Migration Dry Runs test passed.');
