const svc=require('../apps/api/src/services/phase43GlobalFederationSovereignCloudService');
const row=svc.normalizeRecord({tenantId:'tenant_demo',domain:'regional-data-residency',name:'Regional Data Residency'});
if(row.domain!=='regional-data-residency'||row.status!=='draft')process.exit(1);
const passed=svc.transitionRecord(row,'pass');
if(passed.status!=='passed')process.exit(1);
const summary=svc.metrics([passed]);
if(summary.total!==1||summary.passed!==1||summary.byDomain['regional-data-residency']!==1)process.exit(1);
console.log('Sprint 672 Regional Data Residency test passed.');
