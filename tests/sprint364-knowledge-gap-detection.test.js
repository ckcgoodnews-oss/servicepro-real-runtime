const svc=require('../apps/api/src/services/phase22ServiceIntelligenceAutomationService');
const row=svc.normalizeRecord({tenantId:'tenant_demo',domain:'knowledge-gap-detection',name:'Knowledge Gap Detection'});
if(row.domain!=='knowledge-gap-detection'||row.status!=='draft')process.exit(1);
const passed=svc.transitionRecord(row,'pass');
if(passed.status!=='passed')process.exit(1);
const summary=svc.metrics([passed]);
if(summary.total!==1||summary.passed!==1||summary.byDomain['knowledge-gap-detection']!==1)process.exit(1);
console.log('Sprint 364 Knowledge Gap Detection test passed.');
