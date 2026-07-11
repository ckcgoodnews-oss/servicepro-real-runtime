const svc=require('../apps/api/src/services/phase22ServiceIntelligenceAutomationService');
const row=svc.normalizeRecord({tenantId:'tenant_demo',domain:'customer-intent-detection',name:'Customer Intent Detection'});
if(row.domain!=='customer-intent-detection'||row.status!=='draft')process.exit(1);
const passed=svc.transitionRecord(row,'pass');
if(passed.status!=='passed')process.exit(1);
const summary=svc.metrics([passed]);
if(summary.total!==1||summary.passed!==1||summary.byDomain['customer-intent-detection']!==1)process.exit(1);
console.log('Sprint 362 Customer Intent Detection test passed.');
