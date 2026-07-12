const svc=require('../apps/api/src/services/phase39Version6GaService');
const row=svc.normalizeRecord({tenantId:'tenant_demo',domain:'tenant-v6-migration-dry-runs',name:'Tenant V6 Migration Dry Runs'});
if(row.domain!=='tenant-v6-migration-dry-runs'||row.status!=='draft')process.exit(1);
const passed=svc.transitionRecord(row,'pass');
if(passed.status!=='passed')process.exit(1);
const summary=svc.metrics([passed]);
if(summary.total!==1||summary.passed!==1||summary.byDomain['tenant-v6-migration-dry-runs']!==1)process.exit(1);
console.log('Sprint 615 Tenant V6 Migration Dry Runs test passed.');
