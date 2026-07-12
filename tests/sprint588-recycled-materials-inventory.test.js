const svc=require('../apps/api/src/services/phase37SustainabilityCircularOperationsService');
const row=svc.normalizeRecord({tenantId:'tenant_demo',domain:'recycled-materials-inventory',name:'Recycled Materials Inventory'});
if(row.domain!=='recycled-materials-inventory'||row.status!=='draft')process.exit(1);
const passed=svc.transitionRecord(row,'pass');
if(passed.status!=='passed')process.exit(1);
const summary=svc.metrics([passed]);
if(summary.total!==1||summary.passed!==1||summary.byDomain['recycled-materials-inventory']!==1)process.exit(1);
console.log('Sprint 588 Recycled Materials Inventory test passed.');
