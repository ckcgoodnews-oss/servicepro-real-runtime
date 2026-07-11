const svc=require('../apps/api/src/services/phase26Version4FoundationRcService');
const row=svc.normalizeRecord({tenantId:'tenant_demo',domain:'version-4-migration-assistant',name:'Version 4 Migration Assistant'});
if(row.domain!=='version-4-migration-assistant'||row.status!=='draft')process.exit(1);
const passed=svc.transitionRecord(row,'pass');
if(passed.status!=='passed')process.exit(1);
const summary=svc.metrics([passed]);
if(summary.total!==1||summary.passed!==1||summary.byDomain['version-4-migration-assistant']!==1)process.exit(1);
console.log('Sprint 427 Version 4 Migration Assistant test passed.');
