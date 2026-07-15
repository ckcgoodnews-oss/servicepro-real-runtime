const assert=require('assert');
const fs=require('fs');
const path=require('path');

const root=path.resolve(__dirname,'..');
const read=file=>fs.readFileSync(path.join(root,file),'utf8');
const exists=file=>fs.existsSync(path.join(root,file));
function match(file,pattern,message){assert.match(read(file),pattern,message||`${file} must match ${pattern}`);}

function validatePhase46Release(){
  const required=['PHASE46_RELEASE_MANIFEST.json','PHASE46_RELEASE_NOTES.md','apps/web/render.yaml','apps/web/wrangler.toml','apps/web/next.config.mjs','apps/web/.env.example'];
  required.forEach(file=>assert.ok(exists(file),`${file} is required`));
  const manifest=JSON.parse(read('PHASE46_RELEASE_MANIFEST.json'));
  const webPackage=JSON.parse(read('apps/web/package.json'));
  assert.strictEqual(manifest.version,'8.0.0-alpha.1');assert.strictEqual(manifest.tag,'v8.0.0-alpha.1');assert.strictEqual(manifest.status,'complete');assert.strictEqual(webPackage.version,manifest.version);
  match('apps/web/render.yaml',/rootDir:\s*apps\/web/);match('apps/web/render.yaml',/buildCommand:\s*npm ci && npm run build/);match('apps/web/render.yaml',/healthCheckPath:\s*\//);match('apps/web/render.yaml',/NEXT_PUBLIC_API_BASE_URL/);
  match('apps/web/wrangler.toml',/pages_build_output_dir\s*=\s*"\.\/out"/);match('apps/web/next.config.mjs',/NEXT_OUTPUT === 'export'/);match('apps/web/next.config.mjs',/'standalone'/);match('apps/web/.env.example',/NEXT_PUBLIC_API_BASE_URL=/);
  match('.github/workflows/ci.yml',/npm run web:build/);match('.github/workflows/ci.yml',/npm run web:build:pages/);
  for(let sprint=716;sprint<=730;sprint++)match('PHASE46_RELEASE_NOTES.md',new RegExp(`Sprint ${sprint}`),`Sprint ${sprint} release notes are required`);
  for(const route of manifest.workspaceRoutes){const file=`apps/web/src/app/(workspace)${route}/page.tsx`;assert.ok(exists(file),`${route} must have a workspace page`);}
  const shell=read('apps/web/src/components/AppShell.tsx');
  const navigationRoutes=[...shell.matchAll(/href:\s*'(\/[^']+)'/g)].map(match=>match[1]);
  for(const route of navigationRoutes)assert.ok(manifest.workspaceRoutes.includes(route),`${route} must be represented in the release manifest`);
  assert.strictEqual(manifest.serviceModel.industryPacks,30);assert.strictEqual(manifest.serviceModel.marketplaceItems,34);
  return {version:manifest.version,tag:manifest.tag,routes:manifest.workspaceRoutes.length,checks:required.length+navigationRoutes.length+25};
}

if(require.main===module){const result=validatePhase46Release();console.log(`Phase 46 release validation passed: ${result.version}, ${result.routes} workspace routes, tag ${result.tag}.`);}
module.exports={validatePhase46Release};
