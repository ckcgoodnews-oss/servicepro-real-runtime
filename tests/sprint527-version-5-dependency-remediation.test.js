const svc=require('../apps/api/src/services/phase33Version5GaService');
const row=svc.normalizeRecord({tenantId:'tenant_demo',domain:'version-5-dependency-remediation',name:'Version 5 Dependency Remediation'});
if(row.domain!=='version-5-dependency-remediation'||row.status!=='draft')process.exit(1);
const passed=svc.transitionRecord(row,'pass');
if(passed.status!=='passed')process.exit(1);
const summary=svc.metrics([passed]);
if(summary.total!==1||summary.passed!==1||summary.byDomain['version-5-dependency-remediation']!==1)process.exit(1);
console.log('Sprint 527 Version 5 Dependency Remediation test passed.');
