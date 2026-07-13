const svc=require('../apps/api/src/services/phase37SustainabilityCircularOperationsService');
const row=svc.normalizeRecord({tenantId:'tenant_demo',domain:'supplier-sustainability-scoring',name:'Supplier Sustainability Scoring'});
if(row.domain!=='supplier-sustainability-scoring'||row.status!=='draft')process.exit(1);
const passed=svc.transitionRecord(row,'pass');
if(passed.status!=='passed')process.exit(1);
const summary=svc.metrics([passed]);
if(summary.total!==1||summary.passed!==1||summary.byDomain['supplier-sustainability-scoring']!==1)process.exit(1);
console.log('Sprint 584 Supplier Sustainability Scoring test passed.');
