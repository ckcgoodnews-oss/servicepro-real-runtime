const svc=require('../apps/api/src/services/phase40HyperautomationEnterpriseOrchestrationService');
const row=svc.normalizeRecord({tenantId:'tenant_demo',domain:'business-rule-engine',name:'Business Rule Engine'});
if(row.domain!=='business-rule-engine'||row.status!=='draft')process.exit(1);
const passed=svc.transitionRecord(row,'pass');
if(passed.status!=='passed')process.exit(1);
const summary=svc.metrics([passed]);
if(summary.total!==1||summary.passed!==1||summary.byDomain['business-rule-engine']!==1)process.exit(1);
console.log('Sprint 630 Business Rule Engine test passed.');
