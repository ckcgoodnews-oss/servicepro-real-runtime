const svc=require('../apps/api/src/services/phase35AgenticWorkforceOrchestrationService');
const row=svc.normalizeRecord({tenantId:'tenant_demo',domain:'multi-agent-coordination',name:'Multi-Agent Coordination'});
if(row.domain!=='multi-agent-coordination'||row.status!=='draft')process.exit(1);
const passed=svc.transitionRecord(row,'pass');
if(passed.status!=='passed')process.exit(1);
const summary=svc.metrics([passed]);
if(summary.total!==1||summary.passed!==1||summary.byDomain['multi-agent-coordination']!==1)process.exit(1);
console.log('Sprint 556 Multi-Agent Coordination test passed.');
