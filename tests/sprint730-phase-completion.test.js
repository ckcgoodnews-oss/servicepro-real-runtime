const assert=require('assert');const fs=require('fs');const path=require('path');const {validatePhase46Release}=require('../scripts/validate-phase46-release');
const root=path.join(__dirname,'..');const read=file=>fs.readFileSync(path.join(root,file),'utf8');
const result=validatePhase46Release();assert.strictEqual(result.version,'8.0.0-alpha.1');assert.strictEqual(result.routes,13);
const customers=read('apps/web/src/components/CustomerWorkspace.tsx');for(const contract of ['/api/v1/customers','/api/v1/jobs','/api/v1/assets','New customer','Edit customer','role="dialog"'])assert.match(customers,new RegExp(contract.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')));
assert.match(read('apps/web/src/app/(workspace)/schedule/page.tsx'),/initialView="calendar"/);assert.match(read('apps/web/src/components/WorkOrderWorkspace.tsx'),/initialView='list'/);
const settings=read('apps/web/src/app/(workspace)/settings/page.tsx');for(const route of ['/profile','/organization','/notifications','/marketplace','/docs'])assert.match(settings,new RegExp(route));
const deployment=read('PHASE46_DEPLOYMENT.md');assert.match(deployment,/Render/);assert.match(deployment,/Cloudflare Pages/);assert.match(deployment,/CORS_ALLOWED_ORIGINS/);
console.log('Sprint 730 phase completion test passed.');
