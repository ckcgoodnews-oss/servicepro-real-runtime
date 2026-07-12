const svc=require('../apps/api/src/services/phase28Version4PostGaReliabilityService');
const row=svc.normalizeRecord({tenantId:'tenant_demo',domain:'lts-release-channels',name:'Lts Release Channels'});
if(row.domain!=='lts-release-channels'||row.status!=='draft')process.exit(1);
const passed=svc.transitionRecord(row,'pass');
if(passed.status!=='passed')process.exit(1);
const summary=svc.metrics([passed]);
if(summary.total!==1||summary.passed!==1||summary.byDomain['lts-release-channels']!==1)process.exit(1);
console.log('Sprint 454 Lts Release Channels test passed.');
