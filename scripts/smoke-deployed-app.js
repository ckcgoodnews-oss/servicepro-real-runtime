const { URL } = require('url');

function baseUrl(value, fallback) { return String(value || fallback).replace(/\/$/, ''); }

async function request(url, options = {}) {
  const controller = new AbortController(); const timeout = setTimeout(() => controller.abort(), options.timeoutMs || 10000);
  try { return await fetch(url, { ...options, signal: controller.signal }); }
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
  const tenantId = options.tenantId || 'tenant_demo'; const email = options.email || ''; const password = options.password || ''; const requireAuth = options.requireAuth === true; const checks = [];
  new URL(webUrl); new URL(apiUrl);

  for (const path of ['/', '/login', '/system-status']) { const response = await request(`${webUrl}${path}`); if (!response.ok) throw new Error(`Website ${path} returned ${response.status}`); checks.push(`website:${path}`); }

  const healthResponse = await request(`${apiUrl}/healthz`, { headers: { origin:webUrl } }); const health = await json(healthResponse, 'API health');
  if (health.ok !== true) throw new Error('API health did not report ok=true'); checks.push('api:health');
  if (healthResponse.headers.get('access-control-allow-origin') !== webUrl) throw new Error(`API CORS does not allow ${webUrl}`); checks.push('api:cors');

  const readiness = await json(await request(`${apiUrl}/readyz`, { headers: { origin:webUrl } }), 'API readiness');
  if (readiness.ready !== true) throw new Error(`API is not ready: ${(readiness.issues || []).join('; ')}`); checks.push('api:readiness');

  if (email || password || requireAuth) {
    if (!email || !password) throw new Error('SMOKE_EMAIL and SMOKE_PASSWORD are required for authenticated smoke testing');
    const login = await json(await request(`${apiUrl}/auth/login`, { method:'POST',headers:{'content-type':'application/json','x-tenant-id':tenantId,origin:webUrl},body:JSON.stringify({email,password}) }), 'Login');
    if (!login.data?.accessToken || login.data?.mfaRequired) throw new Error('Login did not return a usable access token'); checks.push('auth:login');
    const authHeaders={authorization:`Bearer ${login.data.accessToken}`,'content-type':'application/json','x-tenant-id':tenantId,origin:webUrl};
    const dashboard = await json(await request(`${apiUrl}/api/v1/dashboard/summary`, {headers:authHeaders}), 'Authenticated dashboard');
    if (!dashboard.data?.kpis) throw new Error('Dashboard response is missing KPIs'); checks.push('auth:dashboard');
    const logoutResponse=await request(`${apiUrl}/auth/logout`,{method:'POST',headers:authHeaders,body:'{}'}); if(!logoutResponse.ok)throw new Error(`Logout returned ${logoutResponse.status}`); checks.push('auth:logout');
  }
  return { ok:true, webUrl, apiUrl, authenticated:checks.includes('auth:login'), checks };
}

if (require.main === module) {
  runDeployedSmoke({webUrl:process.env.SMOKE_WEB_URL,apiUrl:process.env.SMOKE_API_URL,tenantId:process.env.SMOKE_TENANT_ID,email:process.env.SMOKE_EMAIL,password:process.env.SMOKE_PASSWORD,requireAuth:process.env.SMOKE_REQUIRE_AUTH === 'true'})
    .then(result=>console.log(JSON.stringify(result,null,2))).catch(error=>{console.error(`Deployed app smoke test failed: ${error.message}`);process.exit(1);});
}

module.exports={runDeployedSmoke};
