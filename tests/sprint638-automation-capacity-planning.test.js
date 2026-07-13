const svc=require('../apps/api/src/services/phase40HyperautomationEnterpriseOrchestrationService');
const row=svc.normalizeRecord({tenantId:'tenant_demo',domain:'automation-capacity-planning',name:'Automation Capacity Planning'});
if(row.domain!=='automation-capacity-planning'||row.status!=='draft')process.exit(1);
const passed=svc.transitionRecord(row,'pass');
if(passed.status!=='passed')process.exit(1);
const summary=svc.metrics([passed]);
if(summary.total!==1||summary.passed!==1||summary.byDomain['automation-capacity-planning']!==1)process.exit(1);
console.log('Sprint 638 Automation Capacity Planning test passed.');
