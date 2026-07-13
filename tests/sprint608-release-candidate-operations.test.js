const svc=require('../apps/api/src/services/phase38Version6FoundationRcService');
const row=svc.normalizeRecord({tenantId:'tenant_demo',domain:'release-candidate-operations',name:'Release Candidate Operations'});
if(row.domain!=='release-candidate-operations'||row.status!=='draft')process.exit(1);
const passed=svc.transitionRecord(row,'pass');
if(passed.status!=='passed')process.exit(1);
const summary=svc.metrics([passed]);
if(summary.total!==1||summary.passed!==1||summary.byDomain['release-candidate-operations']!==1)process.exit(1);
console.log('Sprint 608 Release Candidate Operations test passed.');
