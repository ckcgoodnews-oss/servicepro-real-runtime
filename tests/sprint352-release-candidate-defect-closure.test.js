const svc=require('../apps/api/src/services/phase21Version3GaService');
const row=svc.normalizeRecord({tenantId:'tenant_demo',domain:'release-candidate-defect-closure',name:'Release Candidate Defect Closure'});
if(row.domain!=='release-candidate-defect-closure'||row.status!=='draft')process.exit(1);
const passed=svc.transitionRecord(row,'pass');
if(passed.status!=='passed')process.exit(1);
const summary=svc.metrics([passed]);
if(summary.total!==1||summary.passed!==1||summary.byDomain['release-candidate-defect-closure']!==1)process.exit(1);
console.log('Sprint 352 Release Candidate Defect Closure test passed.');
