const svc=require('../apps/api/src/services/phase22ServiceIntelligenceAutomationService');
const row=svc.normalizeRecord({tenantId:'tenant_demo',domain:'ai-resolution-recommendations',name:'AI Resolution Recommendations'});
if(row.domain!=='ai-resolution-recommendations'||row.status!=='draft')process.exit(1);
const passed=svc.transitionRecord(row,'pass');
if(passed.status!=='passed')process.exit(1);
const summary=svc.metrics([passed]);
if(summary.total!==1||summary.passed!==1||summary.byDomain['ai-resolution-recommendations']!==1)process.exit(1);
console.log('Sprint 358 AI Resolution Recommendations test passed.');
