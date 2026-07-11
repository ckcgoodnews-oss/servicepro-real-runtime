const svc=require('../apps/api/src/services/phase23CustomerExperienceFieldMobilityService');
const row=svc.normalizeRecord({tenantId:'tenant_demo',domain:'customer-self-service-automation',name:'Customer Self-Service Automation'});
if(row.domain!=='customer-self-service-automation'||row.status!=='draft')process.exit(1);
const passed=svc.transitionRecord(row,'pass');
if(passed.status!=='passed')process.exit(1);
const summary=svc.metrics([passed]);
if(summary.total!==1||summary.passed!==1||summary.byDomain['customer-self-service-automation']!==1)process.exit(1);
console.log('Sprint 381 Customer Self-Service Automation test passed.');
