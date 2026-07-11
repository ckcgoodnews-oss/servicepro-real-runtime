const svc=require('../apps/api/src/services/phase22ServiceIntelligenceAutomationService');
const row=svc.normalizeRecord({tenantId:'tenant_demo',domain:'predictive-sla-risk',name:'Predictive SLA Risk'});
if(row.domain!=='predictive-sla-risk'||row.status!=='draft')process.exit(1);
const passed=svc.transitionRecord(row,'pass');
if(passed.status!=='passed')process.exit(1);
const summary=svc.metrics([passed]);
if(summary.total!==1||summary.passed!==1||summary.byDomain['predictive-sla-risk']!==1)process.exit(1);
console.log('Sprint 360 Predictive SLA Risk test passed.');
