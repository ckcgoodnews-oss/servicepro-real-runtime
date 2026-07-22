const assert=require('assert');
const crypto=require('crypto');
const {createAccessEntitlementsRepository}=require('../apps/api/src/repositories/accessEntitlementsRepository');
const {ownerAccessGuard}=require('../apps/api/src/middleware/ownerAccessGuard');
const {hashToken}=require('../apps/api/src/services/tokenService');

(async()=>{
  const data={users:[{id:'owner-1',tenantId:'tenant_demo',email:'owner@example.com',name:'Owner',roles:['owner']}],ownerAccessEntitlements:[]};
  const store={type:'json',read:()=>data,write:()=>{}};
  const repo=createAccessEntitlementsRepository(store);
  const raw=`sp_access_${crypto.randomBytes(12).toString('hex')}`;
  const issued=await repo.issue({tenantId:'tenant_demo',userId:'owner-1',tokenHash:hashToken(raw),tokenLastFour:raw.slice(-4),expiresAt:new Date(Date.now()+86400000).toISOString(),createdBy:'admin-1'});
  assert.equal(issued.status,'pending');
  assert.equal((await repo.listOwners())[0].entitlement.status,'pending');
  assert.ok(await repo.redeem('tenant_demo','owner-1',hashToken(raw)));
  const req={context:{tenantId:'tenant_demo',userId:'owner-1',email:'owner@example.com',roles:['owner'],repositories:{accessEntitlements:repo}}};
  assert.equal(await ownerAccessGuard(req,{}),true);
  await repo.update(issued.id,{status:'suspended'});
  const res={setHeader(){},end(value){this.body=JSON.parse(value)}};
  assert.equal(await ownerAccessGuard(req,res),false);
  assert.equal(res.statusCode,402);
  assert.equal(res.body.error.code,'owner_access_required');
  console.log('Owner access entitlement test passed.');
})().catch(error=>{console.error(error);process.exit(1)});
