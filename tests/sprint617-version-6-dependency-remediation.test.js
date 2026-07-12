const svc=require('../apps/api/src/services/phase39Version6GaService');
const row=svc.normalizeRecord({tenantId:'tenant_demo',domain:'version-6-dependency-remediation',name:'Version 6 Dependency Remediation'});
if(row.domain!=='version-6-dependency-remediation'||row.status!=='draft')process.exit(1);
const passed=svc.transitionRecord(row,'pass');
if(passed.status!=='passed')process.exit(1);
const summary=svc.metrics([passed]);
if(summary.total!==1||summary.passed!==1||summary.byDomain['version-6-dependency-remediation']!==1)process.exit(1);
console.log('Sprint 617 Version 6 Dependency Remediation test passed.');
