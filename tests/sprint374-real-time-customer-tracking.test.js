const svc=require('../apps/api/src/services/phase23CustomerExperienceFieldMobilityService');
const row=svc.normalizeRecord({tenantId:'tenant_demo',domain:'real-time-customer-tracking',name:'Real-Time Customer Tracking'});
if(row.domain!=='real-time-customer-tracking'||row.status!=='draft')process.exit(1);
const passed=svc.transitionRecord(row,'pass');
if(passed.status!=='passed')process.exit(1);
const summary=svc.metrics([passed]);
if(summary.total!==1||summary.passed!==1||summary.byDomain['real-time-customer-tracking']!==1)process.exit(1);
console.log('Sprint 374 Real-Time Customer Tracking test passed.');
