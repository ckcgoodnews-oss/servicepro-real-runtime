const svc=require('../apps/api/src/services/phase22ServiceIntelligenceAutomationService');
const row=svc.normalizeRecord({tenantId:'tenant_demo',domain:'service-quality-scoring',name:'Service Quality Scoring'});
if(row.domain!=='service-quality-scoring'||row.status!=='draft')process.exit(1);
const passed=svc.transitionRecord(row,'pass');
if(passed.status!=='passed')process.exit(1);
const summary=svc.metrics([passed]);
if(summary.total!==1||summary.passed!==1||summary.byDomain['service-quality-scoring']!==1)process.exit(1);
console.log('Sprint 365 Service Quality Scoring test passed.');
