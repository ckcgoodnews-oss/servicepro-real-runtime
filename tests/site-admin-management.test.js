const test = require('node:test');
const assert = require('node:assert/strict');
const {createSiteAdminRepository} = require('../apps/api/src/repositories/siteAdminRepository');
const {createUserRepository} = require('../apps/api/src/repositories/userRepository');
const {verifyPassword} = require('../apps/api/src/services/passwordService');
const routes = require('../apps/api/src/routes/siteAdmins');

function fixture(platformAdmin=true) {
  let data = {users:[]};
  const store = {type:'json',read:()=>structuredClone(data),write:value=>{data=structuredClone(value);}};
  const events=[]; const revoked=[];
  const repositories = {users:createUserRepository(store),siteAdmin:createSiteAdminRepository(store),audit:{create:async(_,event)=>events.push(event)},authSessions:{revokeForUser:async(tenant,id)=>revoked.push([tenant,id])}};
  const req = {context:{platformAdmin,email:'5189213@gmail.com',userId:'actor',authTenantId:'tenant_demo',repositories},body:{email:'new-admin@example.com',name:'Site Admin',password:'Test-only-password-123!'}};
  const res = {setHeader(){},end(value){this.body=JSON.parse(value);}};
  return {req,res,repositories,events,revoked};
}
test('company admin cannot grant, list, reset or revoke site administrators',async()=>{
  const f=fixture(false); f.req.context.roles=['owner','admin'];
  for(const action of ['grant','list','resetPassword','revoke']) {
    await routes[action](f.req,f.res,'target'); assert.equal(f.res.statusCode,403);
  }
  assert.deepEqual(await f.repositories.siteAdmin.list(),[]);
});
test('creates a site administrator with a hashed password and a private registry grant',async()=>{
  const f=fixture(); await routes.grant(f.req,f.res);
  assert.equal(f.res.statusCode,201);
  const user=await f.repositories.users.findById('tenant_demo',f.res.body.data.id);
  assert.equal(await verifyPassword(f.req.body.password,user.passwordHash),true);
  assert.equal(await f.repositories.siteAdmin.has('tenant_demo',user.id),true);
  assert.equal(JSON.stringify(f.res.body).includes('password'),false);
  assert.equal(JSON.stringify(f.events).includes(f.req.body.password),false);
});
test('granting an existing account preserves its password and company roles',async()=>{
  const f=fixture(); const user=await f.repositories.users.create({tenantId:'tenant_demo',email:f.req.body.email,name:'Existing',password:'Existing-password-123!',roles:['billing']});
  f.req.body.password='ignored'; await routes.grant(f.req,f.res);
  const after=await f.repositories.users.findById('tenant_demo',user.id);
  assert.equal(f.res.statusCode,200); assert.equal(after.passwordHash,user.passwordHash); assert.deepEqual(after.roles,['billing']);
});
test('new accounts require a valid email and strong password',async()=>{
  const f=fixture(); f.req.body.password='weak'; await routes.grant(f.req,f.res); assert.equal(f.res.statusCode,400);
  f.req.body.email='invalid'; await routes.grant(f.req,f.res); assert.equal(f.res.statusCode,400);
  assert.deepEqual(await f.repositories.siteAdmin.list(),[]);
});
test('password resets revoke sessions and return no credentials',async()=>{
  const f=fixture(); await routes.grant(f.req,f.res); const id=f.res.body.data.id;
  f.req.body={password:'Replacement-password-123!'}; await routes.resetPassword(f.req,f.res,id);
  assert.equal(f.res.statusCode,200); assert.equal(f.res.body.data.passwordReset,true);
  assert.deepEqual(f.revoked,[['tenant_demo',id]]);
  assert.equal(await verifyPassword(f.req.body.password,(await f.repositories.users.findById('tenant_demo',id)).passwordHash),true);
});
test('removing a grant preserves the company account and revokes sessions',async()=>{
  const f=fixture(); await routes.grant(f.req,f.res); const id=f.res.body.data.id;
  await routes.revoke(f.req,f.res,id); assert.equal(f.res.statusCode,200);
  assert.equal(await f.repositories.siteAdmin.has('tenant_demo',id),false);
  assert.ok(await f.repositories.users.findById('tenant_demo',id)); assert.equal(f.revoked.length,1);
});
test('self-removal and recovery-admin removal are blocked',async()=>{
  const f=fixture(); await routes.grant(f.req,f.res); const id=f.res.body.data.id;
  f.req.context.userId=id; await routes.revoke(f.req,f.res,id); assert.equal(f.res.statusCode,400);
  f.req.context.userId='actor'; f.req.body.email='5189213@gmail.com'; await routes.grant(f.req,f.res);
  await routes.revoke(f.req,f.res,f.res.body.data.id); assert.equal(f.res.statusCode,400);
});
test('user roles alone cannot create a registry grant and grants are tenant bound',async()=>{
  const f=fixture(); const user=await f.repositories.users.create({tenantId:'other',email:'same@example.com',password:'Example-password-123!',roles:['site_admin','admin','owner']});
  assert.equal(await f.repositories.siteAdmin.has('other',user.id),false);
  await f.repositories.siteAdmin.grant({tenantId:'tenant_demo',userId:user.id,grantedBy:'actor'});
  assert.equal(await f.repositories.siteAdmin.has('other',user.id),false);
});
