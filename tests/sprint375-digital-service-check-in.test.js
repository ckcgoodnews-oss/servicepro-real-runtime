const svc=require('../apps/api/src/services/phase23CustomerExperienceFieldMobilityService');
const row=svc.normalizeRecord({tenantId:'tenant_demo',domain:'digital-service-check-in',name:'Digital Service Check-In'});
if(row.domain!=='digital-service-check-in'||row.status!=='draft')process.exit(1);
const passed=svc.transitionRecord(row,'pass');
if(passed.status!=='passed')process.exit(1);
const summary=svc.metrics([passed]);
if(summary.total!==1||summary.passed!==1||summary.byDomain['digital-service-check-in']!==1)process.exit(1);
console.log('Sprint 375 Digital Service Check-In test passed.');
