const svc=require('../apps/api/src/services/phase22ServiceIntelligenceAutomationService');
const row=svc.normalizeRecord({tenantId:'tenant_demo',domain:'automated-dispatch-optimization',name:'Automated Dispatch Optimization'});
if(row.domain!=='automated-dispatch-optimization'||row.status!=='draft')process.exit(1);
const passed=svc.transitionRecord(row,'pass');
if(passed.status!=='passed')process.exit(1);
const summary=svc.metrics([passed]);
if(summary.total!==1||summary.passed!==1||summary.byDomain['automated-dispatch-optimization']!==1)process.exit(1);
console.log('Sprint 359 Automated Dispatch Optimization test passed.');
