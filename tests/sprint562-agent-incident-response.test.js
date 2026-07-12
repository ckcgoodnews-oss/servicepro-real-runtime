const svc=require('../apps/api/src/services/phase35AgenticWorkforceOrchestrationService');
const row=svc.normalizeRecord({tenantId:'tenant_demo',domain:'agent-incident-response',name:'Agent Incident Response'});
if(row.domain!=='agent-incident-response'||row.status!=='draft')process.exit(1);
const passed=svc.transitionRecord(row,'pass');
if(passed.status!=='passed')process.exit(1);
const summary=svc.metrics([passed]);
if(summary.total!==1||summary.passed!==1||summary.byDomain['agent-incident-response']!==1)process.exit(1);
console.log('Sprint 562 Agent Incident Response test passed.');
