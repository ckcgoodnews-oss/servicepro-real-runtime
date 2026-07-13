const svc=require('../apps/api/src/services/phase38Version6FoundationRcService');
const row=svc.normalizeRecord({tenantId:'tenant_demo',domain:'version-6-release-candidate',name:'Version 6 Release Candidate'});
if(row.domain!=='version-6-release-candidate'||row.status!=='draft')process.exit(1);
const passed=svc.transitionRecord(row,'pass');
if(passed.status!=='passed')process.exit(1);
const summary=svc.metrics([passed]);
if(summary.total!==1||summary.passed!==1||summary.byDomain['version-6-release-candidate']!==1)process.exit(1);
console.log('Sprint 610 Version 6 Release Candidate test passed.');
