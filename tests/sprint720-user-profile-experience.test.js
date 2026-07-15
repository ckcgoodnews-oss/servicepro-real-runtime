const assert=require('assert');
const fs=require('fs');
const path=require('path');
const { createUserRepository }=require('../apps/api/src/repositories/userRepository');
const profile=require('../apps/api/src/routes/profile');
const { authGuard }=require('../apps/api/src/middleware/authGuard');
const { hashPassword }=require('../apps/api/src/services/passwordService');

function response(){return{setHeader(){},end(raw){this.body=raw?JSON.parse(raw):{};}};}
(async()=>{
  const data={users:[{id:'user-1',tenantId:'tenant_demo',email:'owner@example.com',name:'Owner',passwordHash:await hashPassword('ChangeMe123!'),roles:['owner'],permissions:[]}],userApiTokens:[]};
  const store={type:'json',read:()=>data,write:()=>{}}; const users=createUserRepository(store);
  const base={context:{tenantId:'tenant_demo',userId:'user-1',repositories:{users}}};
  let res=response(); await profile.update({...base,body:{name:'Business Owner',timezone:'UTC',locale:'en-US',notificationPreferences:{product:true}}},res); assert.equal(res.body.data.name,'Business Owner'); assert.equal(res.body.data.notificationPreferences.product,true);
  res=response(); await profile.setMfa({...base,body:{enabled:true}},res); assert.equal(res.body.data.mfaEnabled,true);
  res=response(); await profile.createToken({...base,body:{name:'Automation'}},res); const raw=res.body.data.token; assert.match(raw,/^sp_live_/); assert.equal(data.userApiTokens.length,1); assert.notEqual(data.userApiTokens[0].tokenHash,raw);
  const guardReq={headers:{authorization:`Bearer ${raw}`},context:{tenantId:'tenant_demo',repositories:{users,authSessions:{isActive:async()=>true}}}}; res=response(); assert.equal(await authGuard(guardReq,res),true); assert.equal(guardReq.context.userId,'user-1');
  assert.equal(await users.revokeApiToken('tenant_demo','user-1',data.userApiTokens[0].id),true); const rejected={headers:{authorization:`Bearer ${raw}`},context:{tenantId:'tenant_demo',repositories:{users,authSessions:{isActive:async()=>true}}}}; res=response(); assert.equal(await authGuard(rejected,res),false); assert.equal(res.body.error.code,'unauthorized');
  const root=path.resolve(__dirname,'..'); const ui=fs.readFileSync(path.join(root,'apps/web/src/components/ProfileWorkspace.tsx'),'utf8'); const migration=fs.readFileSync(path.join(root,'packages/database/postgres/720_user_profile_experience.sql'),'utf8');
  for(const text of ['Personal details','Multi-factor authentication','Notifications','Change password','API tokens']) assert.match(ui,new RegExp(text));
  assert.match(migration,/runtime_user_api_tokens/); assert.match(migration,/notification_preferences/);
  console.log('Sprint 720 user profile experience test passed.');
})().catch(error=>{console.error(error);process.exit(1);});
