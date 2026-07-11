const svc=require('../apps/api/src/services/phase16EnterpriseIntelligenceService');
const row=svc.normalizeRecord({tenantId:'tenant_demo',domain:'agent-tool-registry',name:'Agent Tool Registry'});
if(row.domain!=='agent-tool-registry'||row.status!=='draft')process.exit(1);
const active=svc.transitionRecord(row,'activate');
if(active.status!=='active')process.exit(1);
const summary=svc.metrics([active]);
if(summary.total!==1||summary.active!==1||summary.byDomain['agent-tool-registry']!==1)process.exit(1);
console.log('Sprint 272 Agent Tool Registry test passed.');
