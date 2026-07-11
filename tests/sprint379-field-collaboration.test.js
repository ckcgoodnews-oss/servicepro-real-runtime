const svc=require('../apps/api/src/services/phase23CustomerExperienceFieldMobilityService');
const row=svc.normalizeRecord({tenantId:'tenant_demo',domain:'field-collaboration',name:'Field Collaboration'});
if(row.domain!=='field-collaboration'||row.status!=='draft')process.exit(1);
const passed=svc.transitionRecord(row,'pass');
if(passed.status!=='passed')process.exit(1);
const summary=svc.metrics([passed]);
if(summary.total!==1||summary.passed!==1||summary.byDomain['field-collaboration']!==1)process.exit(1);
console.log('Sprint 379 Field Collaboration test passed.');
