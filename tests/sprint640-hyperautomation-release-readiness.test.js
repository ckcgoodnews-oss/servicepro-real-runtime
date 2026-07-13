const svc=require('../apps/api/src/services/phase40HyperautomationEnterpriseOrchestrationService');
const row=svc.normalizeRecord({tenantId:'tenant_demo',domain:'hyperautomation-release-readiness',name:'Hyperautomation Release Readiness'});
if(row.domain!=='hyperautomation-release-readiness'||row.status!=='draft')process.exit(1);
const passed=svc.transitionRecord(row,'pass');
if(passed.status!=='passed')process.exit(1);
const summary=svc.metrics([passed]);
if(summary.total!==1||summary.passed!==1||summary.byDomain['hyperautomation-release-readiness']!==1)process.exit(1);
console.log('Sprint 640 Hyperautomation Release Readiness test passed.');
