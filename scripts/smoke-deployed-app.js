const fs = require('fs');
const path = require('path');
const { URL } = require('url');

function baseUrl(value, fallback) { return String(value || fallback).replace(/\/$/, ''); }

async function request(url, options = {}) {
  const { timeoutMs = 10000, ...fetchOptions } = options;
  const controller = new AbortController(); const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try { return await fetch(url, { ...fetchOptions, signal: controller.signal }); }
  catch (error) { if (error instanceof DOMException && error.name === 'AbortError') throw new Error(`${url} timed out`); throw error; }
  finally { clearTimeout(timeout); }
}

async function json(response, label) {
  let body; try { body = await response.json(); } catch { throw new Error(`${label} did not return JSON`); }
  if (!response.ok) throw new Error(`${label} returned ${response.status}: ${body.error?.message || body.issues?.join('; ') || 'request failed'}`);
  return body;
}

async function runDeployedSmoke(options = {}) {
  const webUrl = baseUrl(options.webUrl, 'http://localhost:3000'); const apiUrl = baseUrl(options.apiUrl, 'http://localhost:10001');
  const tenantId = options.tenantId || 'tenant_demo'; const email = options.email || ''; const password = options.password || ''; const expectedVersion=options.expectedVersion || ''; const expectedStore=String(options.expectedStore || '').trim().toLowerCase(); const requireAuth = options.requireAuth === true; const configuredTimeout=Number(options.timeoutMs || 10000); const timeoutMs=Number.isFinite(configuredTimeout)&&configuredTimeout>0?configuredTimeout:10000; const checks = [];
  new URL(webUrl); new URL(apiUrl);
  if (expectedStore && !['json', 'postgres'].includes(expectedStore)) throw new Error('SMOKE_EXPECTED_STORE must be json or postgres');

  for (const path of ['/', '/login', '/system-status']) { const response = await request(`${webUrl}${path}`,{timeoutMs}); if (!response.ok) throw new Error(`Website ${path} returned ${response.status}`); checks.push(`website:${path}`); }

  const healthResponse = await request(`${apiUrl}/healthz`, { headers: { origin:webUrl },timeoutMs }); const health = await json(healthResponse, 'API health');
  if (health.ok !== true) throw new Error('API health did not report ok=true'); checks.push('api:health');
  if(expectedVersion&&health.version!==expectedVersion)throw new Error(`API version ${health.version||'unknown'} is stale; expected ${expectedVersion}. Deploy the latest commit.`); checks.push('api:version');
  if (healthResponse.headers.get('access-control-allow-origin') !== webUrl) throw new Error(`API CORS does not allow ${webUrl}`); checks.push('api:cors');

  const readiness = await json(await request(`${apiUrl}/readyz`, { headers: { origin:webUrl },timeoutMs }), 'API readiness');
  if (readiness.ready !== true) throw new Error(`API is not ready: ${(readiness.issues || []).join('; ')}`); checks.push('api:readiness');
  if(readiness.checks?.dataStore!==true)throw new Error('API readiness contract is stale; deploy the latest commit.');checks.push('api:data-store');
  if(expectedStore&&readiness.store!==expectedStore)throw new Error(`API is using ${readiness.store||'an unknown store'}; expected ${expectedStore}.`);
  if(expectedStore)checks.push(`api:store:${expectedStore}`);

  if (email || password || requireAuth) {
    if (!email || !password) throw new Error('SMOKE_EMAIL and SMOKE_PASSWORD are required for authenticated smoke testing');
    const login = await json(await request(`${apiUrl}/auth/login`, { method:'POST',headers:{'content-type':'application/json','x-tenant-id':tenantId,origin:webUrl},body:JSON.stringify({email,password}),timeoutMs }), 'Login');
    if (!login.data?.accessToken || login.data?.mfaRequired) throw new Error('Login did not return a usable access token'); checks.push('auth:login');
    if(login.data.user?.tenantId!==tenantId)throw new Error(`Login returned tenant ${login.data.user?.tenantId||'unknown'}; expected ${tenantId}.`);checks.push('auth:tenant');
    const authHeaders={authorization:`Bearer ${login.data.accessToken}`,'content-type':'application/json','x-tenant-id':tenantId,origin:webUrl};
    const dashboard = await json(await request(`${apiUrl}/api/v1/dashboard/summary`, {headers:authHeaders,timeoutMs}), 'Authenticated dashboard');
    if (!dashboard.data?.kpis) throw new Error('Dashboard response is missing KPIs'); checks.push('auth:dashboard');
    const logoutResponse=await request(`${apiUrl}/auth/logout`,{method:'POST',headers:authHeaders,body:'{}',timeoutMs}); if(!logoutResponse.ok)throw new Error(`Logout returned ${logoutResponse.status}`); checks.push('auth:logout');
  }
  return { ok:true, checkedAt:new Date().toISOString(), webUrl, apiUrl, tenantId, store:readiness.store || null, version:health.version || null, authenticated:checks.includes('auth:login'), checks };
}

function writeSmokeReport(reportPath, result) {
  const target = path.resolve(reportPath);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  const temporary = `${target}.${process.pid}.tmp`;
  fs.writeFileSync(temporary, `${JSON.stringify(result, null, 2)}\n`, { mode: 0o600 });
  fs.renameSync(temporary, target);
  return target;
}

if (require.main === module) {
  runDeployedSmoke({webUrl:process.env.SMOKE_WEB_URL,apiUrl:process.env.SMOKE_API_URL,tenantId:process.env.SMOKE_TENANT_ID,email:process.env.SMOKE_EMAIL,password:process.env.SMOKE_PASSWORD,expectedVersion:process.env.SMOKE_EXPECTED_VERSION,expectedStore:process.env.SMOKE_EXPECTED_STORE,requireAuth:process.env.SMOKE_REQUIRE_AUTH === 'true',timeoutMs:process.env.SMOKE_TIMEOUT_MS})
    .then(result=>{
      if(process.env.SMOKE_REPORT_PATH)writeSmokeReport(process.env.SMOKE_REPORT_PATH,result);
      console.log(JSON.stringify(result,null,2));
    }).catch(error=>{console.error(`Deployed app smoke test failed: ${error.message}`);process.exit(1);});
}

module.exports={runDeployedSmoke,writeSmokeReport};
