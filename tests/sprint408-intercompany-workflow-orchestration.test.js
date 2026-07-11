const svc=require('../apps/api/src/services/phase25EnterpriseFederationEcosystemService');
const row=svc.normalizeRecord({tenantId:'tenant_demo',domain:'intercompany-workflow-orchestration',name:'Intercompany Workflow Orchestration'});
if(row.domain!=='intercompany-workflow-orchestration'||row.status!=='draft')process.exit(1);
const passed=svc.transitionRecord(row,'pass');
if(passed.status!=='passed')process.exit(1);
const summary=svc.metrics([passed]);
if(summary.total!==1||summary.passed!==1||summary.byDomain['intercompany-workflow-orchestration']!==1)process.exit(1);
console.log('Sprint 408 Intercompany Workflow Orchestration test passed.');
