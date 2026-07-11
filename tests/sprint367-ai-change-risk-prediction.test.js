const svc=require('../apps/api/src/services/phase22ServiceIntelligenceAutomationService');
const row=svc.normalizeRecord({tenantId:'tenant_demo',domain:'ai-change-risk-prediction',name:'AI Change Risk Prediction'});
if(row.domain!=='ai-change-risk-prediction'||row.status!=='draft')process.exit(1);
const passed=svc.transitionRecord(row,'pass');
if(passed.status!=='passed')process.exit(1);
const summary=svc.metrics([passed]);
if(summary.total!==1||summary.passed!==1||summary.byDomain['ai-change-risk-prediction']!==1)process.exit(1);
console.log('Sprint 367 AI Change Risk Prediction test passed.');
