const svc=require('../apps/api/src/services/phase24FinancialGrowthOperationsService');
const row=svc.normalizeRecord({tenantId:'tenant_demo',domain:'financial-controls-automation',name:'Financial Controls Automation'});
if(row.domain!=='financial-controls-automation'||row.status!=='draft')process.exit(1);
const passed=svc.transitionRecord(row,'pass');
if(passed.status!=='passed')process.exit(1);
const summary=svc.metrics([passed]);
if(summary.total!==1||summary.passed!==1||summary.byDomain['financial-controls-automation']!==1)process.exit(1);
console.log('Sprint 397 Financial Controls Automation test passed.');
