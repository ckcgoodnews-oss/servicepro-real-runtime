const svc=require('../apps/api/src/services/phase15PostGaLtsService');
const row=svc.normalizeRecord({tenantId:'tenant_demo',domain:'production-telemetry-baseline',name:'Production Telemetry Baseline'});
if(row.domain!=='production-telemetry-baseline'||row.status!=='draft')process.exit(1);
const active=svc.transitionRecord(row,'activate');
if(active.status!=='active')process.exit(1);
const summary=svc.metrics([active]);
if(summary.total!==1||summary.active!==1||summary.byDomain['production-telemetry-baseline']!==1)process.exit(1);
console.log('Sprint 251 Production Telemetry Baseline test passed.');
