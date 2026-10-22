const test=require('node:test');
const assert=require('node:assert/strict');
// Unit isolation: authorization permission discovery is tested by API CI.
const permissionPath=require.resolve('../apps/api/src/auth/permissions');
require.cache[permissionPath]={id:permissionPath,filename:permissionPath,loaded:true,exports:{permissionsForRoles:()=>[]}};
const auth=require('../apps/api/src/routes/auth');
const {createUserRepository}=require('../apps/api/src/repositories/userRepository');
const {createAuthSessionRepository}=require('../apps/api/src/repositories/authSessionRepository');
const {hashToken}=require('../apps/api/src/services/tokenService');

test('production reset delivery preserves privacy, tenant scope and token lifecycle',async()=>{
  const names=['RESEND_API_KEY','EMAIL_FROM','PASSWORD_RESET_APP_URL','NODE_ENV','EXPOSE_AUTH_TOKENS'];
  const previous=Object.fromEntries(names.map(name=>[name,process.env[name]]));
  const oldFetch=global.fetch,oldError=console.error;
  let data={users:[]}; const store={type:'json',read:()=>structuredClone(data),write:value=>{data=structuredClone(value);}};
  const users=createUserRepository(store),sessions=createAuthSessionRepository(store);
  const events=[],errors=[],sends=[];
  const user=await users.create({tenantId:'test-tenant',email:'owner@example.com',name:'Test Owner',password:'Test-only-password-123!',roles:['owner']});
  const request=(email,tenantId='test-tenant')=>({body:{email},context:{tenantId,repositories:{users,authSessions:sessions,authEvents:{log:async event=>events.push(event)}}}});
  const response=()=>({setHeader(){},end(raw){this.body=JSON.parse(raw);}});
  try {
    Object.assign(process.env,{RESEND_API_KEY:'unit-test-only',EMAIL_FROM:'ServicePRO <noreply@example.com>',PASSWORD_RESET_APP_URL:'https://example.com',NODE_ENV:'production',EXPOSE_AUTH_TOKENS:'true'});
    console.error=(...args)=>errors.push(args.join(' '));
    global.fetch=async(url,options)=>{assert.equal(url,'https://api.resend.com/emails');sends.push(JSON.parse(options.body));return {ok:true,status:200};};
    const accepted=response(); await auth.requestPasswordReset(request(' owner@example.com '),accepted);
    assert.equal(accepted.statusCode,202); assert.deepEqual(accepted.body,{data:{accepted:true}});
    assert.deepEqual(sends[0].to,[user.email]);
    const link=sends[0].text.match(/https:\/\/[^\s]+/)[0]; const token=new URL(link).searchParams.get('token');
    assert.ok(token); assert.equal(new URL(link).pathname,'/reset-password');
    assert.equal(data.passwordResetTokens[0].tokenHash,hashToken(token));
    assert.ok(!JSON.stringify(data).includes(token));
    assert.ok(await sessions.consumePasswordReset('test-tenant',hashToken(token)));
    assert.equal(await sessions.consumePasswordReset('test-tenant',hashToken(token)),null);
    for(const req of [request('unknown@example.com'),request(user.email,'other-tenant')]) {
      const res=response(); await auth.requestPasswordReset(req,res); assert.deepEqual(res.body,accepted.body);
    }
    assert.equal(sends.length,1);
    delete process.env.RESEND_API_KEY;
    const missing=response(); await auth.requestPasswordReset(request(user.email),missing); assert.deepEqual(missing.body,accepted.body);
    process.env.RESEND_API_KEY='unit-test-only';
    global.fetch=async()=>({ok:false,status:403});
    const rejected=response(); await auth.requestPasswordReset(request(user.email),rejected); assert.deepEqual(rejected.body,accepted.body);
    assert.equal(errors.length,2); assert.ok(!errors.join(' ').includes(token)); assert.ok(!errors.join(' ').includes('unit-test-only'));
    process.env.PASSWORD_RESET_APP_URL='http://example.com'; global.fetch=async()=>assert.fail('Insecure reset URLs must not be sent');
    const insecure=response(); await auth.requestPasswordReset(request(user.email),insecure); assert.deepEqual(insecure.body,accepted.body);
  } finally {
    global.fetch=oldFetch; console.error=oldError;
    for(const name of names)if(previous[name]===undefined)delete process.env[name];else process.env[name]=previous[name];
  }
});
