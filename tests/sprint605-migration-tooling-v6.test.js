const svc=require('../apps/api/src/services/phase38Version6FoundationRcService');
const row=svc.normalizeRecord({tenantId:'tenant_demo',domain:'migration-tooling-v6',name:'Migration Tooling V6'});
if(row.domain!=='migration-tooling-v6'||row.status!=='draft')process.exit(1);
const passed=svc.transitionRecord(row,'pass');
if(passed.status!=='passed')process.exit(1);
const summary=svc.metrics([passed]);
if(summary.total!==1||summary.passed!==1||summary.byDomain['migration-tooling-v6']!==1)process.exit(1);
console.log('Sprint 605 Migration Tooling V6 test passed.');
