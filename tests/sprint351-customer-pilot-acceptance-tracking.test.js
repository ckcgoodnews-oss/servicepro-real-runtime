const svc=require('../apps/api/src/services/phase21Version3GaService');
const row=svc.normalizeRecord({tenantId:'tenant_demo',domain:'customer-pilot-acceptance-tracking',name:'Customer Pilot Acceptance Tracking'});
if(row.domain!=='customer-pilot-acceptance-tracking'||row.status!=='draft')process.exit(1);
const passed=svc.transitionRecord(row,'pass');
if(passed.status!=='passed')process.exit(1);
const summary=svc.metrics([passed]);
if(summary.total!==1||summary.passed!==1||summary.byDomain['customer-pilot-acceptance-tracking']!==1)process.exit(1);
console.log('Sprint 351 Customer Pilot Acceptance Tracking test passed.');
