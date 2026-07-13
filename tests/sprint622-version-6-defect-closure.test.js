const svc=require('../apps/api/src/services/phase39Version6GaService');
const row=svc.normalizeRecord({tenantId:'tenant_demo',domain:'version-6-defect-closure',name:'Version 6 Defect Closure'});
if(row.domain!=='version-6-defect-closure'||row.status!=='draft')process.exit(1);
const passed=svc.transitionRecord(row,'pass');
if(passed.status!=='passed')process.exit(1);
const summary=svc.metrics([passed]);
if(summary.total!==1||summary.passed!==1||summary.byDomain['version-6-defect-closure']!==1)process.exit(1);
console.log('Sprint 622 Version 6 Defect Closure test passed.');
