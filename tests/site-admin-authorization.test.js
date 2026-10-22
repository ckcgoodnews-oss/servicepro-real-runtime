const test = require('node:test');
const assert = require('node:assert/strict');
// Isolate the guard from filesystem-based permission discovery. Integration
// startup is a separate check; this fixture tests authorization decisions only.
const permissionPath = require.resolve('../apps/api/src/auth/permissions');
require.cache[permissionPath] = {id:permissionPath,filename:permissionPath,loaded:true,exports:{permissionsForRoles:roles=>roles.includes('admin') ? ['all.test.permissions'] : []}};
const {authGuard} = require('../apps/api/src/middleware/authGuard');
const {issueAccessToken} = require('../apps/api/src/services/tokenService');
const {isPlatformAdmin} = require('../apps/api/src/services/platformAdminService');
function fixture() {
  let granted=true;
  const identity={id:'account-id',tenantId:'tenant_demo',email:'admin@example.com',status:'active'};
  const repositories={users:{findById:async()=>identity},siteAdmin:{has:async()=>granted},workspaces:{find:async tenantId=>({tenantId})},authSessions:{isActive:async()=>true}};
  const token=issueAccessToken({userId:identity.id,tenantId:identity.tenantId,email:identity.email,roles:['admin','site_admin'],sessionId:'session'});
  return {identity,repositories,revoke:()=>{granted=false;},request:(tenantId='tenant_demo')=>({headers:{authorization:`Bearer ${token}`},context:{tenantId,repositories}}),response:()=>({setHeader(){},end(value){this.body=JSON.parse(value);}})};
}
test('registry grants allow cross-company access and full permissions',async()=>{
  const f=fixture(); const req=f.request('other-company'); const res=f.response();
  assert.equal(await authGuard(req,res),true); assert.equal(isPlatformAdmin(req),true);
  assert.deepEqual(req.context.permissions,['all.test.permissions']); assert.equal(req.context.authTenantId,'tenant_demo');
});
test('revocation blocks cross-company use of the same still-valid JWT immediately',async()=>{
  const f=fixture(); assert.equal(await authGuard(f.request('other-company'),f.response()),true);
  f.revoke(); const res=f.response(); assert.equal(await authGuard(f.request('other-company'),res),false); assert.equal(res.statusCode,403);
  const req=f.request(); assert.equal(await authGuard(req,f.response()),true); assert.equal(isPlatformAdmin(req),false);
});
test('admin or site_admin role claims do not grant global privileges',async()=>{
  const f=fixture(); f.revoke(); const req=f.request(); assert.equal(await authGuard(req,f.response()),true); assert.equal(req.context.platformAdmin,false);
});
test('an allowlisted email in another company is not a recovery administrator',async()=>{
  const f=fixture(); f.revoke(); f.identity.email='5189213@gmail.com'; f.identity.tenantId='untrusted-company';
  const req=f.request(); assert.equal(await authGuard(req,f.response()),true); assert.equal(req.context.platformAdmin,false);
});
test('inactive accounts cannot retain site access',async()=>{
  const f=fixture(); f.identity.status='suspended'; const res=f.response();
  assert.equal(await authGuard(f.request(),res),false); assert.equal(res.statusCode,401);
});
test('revoked sessions cannot use a registry grant',async()=>{
  const f=fixture(); f.repositories.authSessions.isActive=async()=>false; const res=f.response();
  assert.equal(await authGuard(f.request(),res),false); assert.equal(res.body.error.code,'session_revoked');
});
test('API tokens do not inherit site administrator privileges',async()=>{
  const f=fixture(); f.repositories.users.findByApiToken=async()=>({user:{...f.identity,roles:['admin']},tokenId:'api-token'});
  const req=f.request('other-company'); req.headers.authorization='Bearer opaque-api-token'; const res=f.response();
  assert.equal(await authGuard(req,res),false); assert.equal(res.statusCode,403);
});
