const svc=require('../apps/api/src/services/phase23CustomerExperienceFieldMobilityService');
const row=svc.normalizeRecord({tenantId:'tenant_demo',domain:'mobile-forms-and-signatures',name:'Mobile Forms and Signatures'});
if(row.domain!=='mobile-forms-and-signatures'||row.status!=='draft')process.exit(1);
const passed=svc.transitionRecord(row,'pass');
if(passed.status!=='passed')process.exit(1);
const summary=svc.metrics([passed]);
if(summary.total!==1||summary.passed!==1||summary.byDomain['mobile-forms-and-signatures']!==1)process.exit(1);
console.log('Sprint 376 Mobile Forms and Signatures test passed.');
