const svc=require('../apps/api/src/services/phase43GlobalFederationSovereignCloudService');
const row=svc.normalizeRecord({tenantId:'tenant_demo',domain:'global-federation-readiness',name:'Global Federation Readiness'});
if(row.domain!=='global-federation-readiness'||row.status!=='draft')process.exit(1);
const passed=svc.transitionRecord(row,'pass');
if(passed.status!=='passed')process.exit(1);
const summary=svc.metrics([passed]);
if(summary.total!==1||summary.passed!==1||summary.byDomain['global-federation-readiness']!==1)process.exit(1);
console.log('Sprint 685 Global Federation Readiness test passed.');
