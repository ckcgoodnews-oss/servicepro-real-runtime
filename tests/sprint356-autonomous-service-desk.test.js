const svc=require('../apps/api/src/services/phase22ServiceIntelligenceAutomationService');
const row=svc.normalizeRecord({tenantId:'tenant_demo',domain:'autonomous-service-desk',name:'Autonomous Service Desk'});
if(row.domain!=='autonomous-service-desk'||row.status!=='draft')process.exit(1);
const passed=svc.transitionRecord(row,'pass');
if(passed.status!=='passed')process.exit(1);
const summary=svc.metrics([passed]);
if(summary.total!==1||summary.passed!==1||summary.byDomain['autonomous-service-desk']!==1)process.exit(1);
console.log('Sprint 356 Autonomous Service Desk test passed.');
