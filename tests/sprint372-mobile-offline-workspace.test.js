const svc=require('../apps/api/src/services/phase23CustomerExperienceFieldMobilityService');
const row=svc.normalizeRecord({tenantId:'tenant_demo',domain:'mobile-offline-workspace',name:'Mobile Offline Workspace'});
if(row.domain!=='mobile-offline-workspace'||row.status!=='draft')process.exit(1);
const passed=svc.transitionRecord(row,'pass');
if(passed.status!=='passed')process.exit(1);
const summary=svc.metrics([passed]);
if(summary.total!==1||summary.passed!==1||summary.byDomain['mobile-offline-workspace']!==1)process.exit(1);
console.log('Sprint 372 Mobile Offline Workspace test passed.');
