const svc=require('../apps/api/src/services/phase34Version5PostGaAssuranceService');
const row=svc.normalizeRecord({tenantId:'tenant_demo',domain:'defect-burn-down',name:'Defect Burn-Down'});
if(row.domain!=='defect-burn-down'||row.status!=='draft')process.exit(1);
const passed=svc.transitionRecord(row,'pass');
if(passed.status!=='passed')process.exit(1);
const summary=svc.metrics([passed]);
if(summary.total!==1||summary.passed!==1||summary.byDomain['defect-burn-down']!==1)process.exit(1);
console.log('Sprint 547 Defect Burn-Down test passed.');
