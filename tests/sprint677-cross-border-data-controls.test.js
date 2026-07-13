const svc=require('../apps/api/src/services/phase43GlobalFederationSovereignCloudService');
const row=svc.normalizeRecord({tenantId:'tenant_demo',domain:'cross-border-data-controls',name:'Cross Border Data Controls'});
if(row.domain!=='cross-border-data-controls'||row.status!=='draft')process.exit(1);
const passed=svc.transitionRecord(row,'pass');
if(passed.status!=='passed')process.exit(1);
const summary=svc.metrics([passed]);
if(summary.total!==1||summary.passed!==1||summary.byDomain['cross-border-data-controls']!==1)process.exit(1);
console.log('Sprint 677 Cross Border Data Controls test passed.');
