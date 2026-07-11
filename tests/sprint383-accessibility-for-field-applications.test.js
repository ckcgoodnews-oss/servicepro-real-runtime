const svc=require('../apps/api/src/services/phase23CustomerExperienceFieldMobilityService');
const row=svc.normalizeRecord({tenantId:'tenant_demo',domain:'accessibility-for-field-applications',name:'Accessibility for Field Applications'});
if(row.domain!=='accessibility-for-field-applications'||row.status!=='draft')process.exit(1);
const passed=svc.transitionRecord(row,'pass');
if(passed.status!=='passed')process.exit(1);
const summary=svc.metrics([passed]);
if(summary.total!==1||summary.passed!==1||summary.byDomain['accessibility-for-field-applications']!==1)process.exit(1);
console.log('Sprint 383 Accessibility for Field Applications test passed.');
