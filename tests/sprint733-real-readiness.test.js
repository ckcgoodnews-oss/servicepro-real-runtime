const assert=require('assert');
const {buildReadiness,readinessHttpStatus}=require('../apps/api/src/services/healthService');

(async()=>{
  const valid={ok:true,errors:[],warnings:[]};
  const json=await buildReadiness({configuration:valid,store:{type:'json',read(){return {ok:true};}}});
  assert.strictEqual(json.ready,true);assert.deepStrictEqual(json.checks,{configuration:true,runtime:true,dataStore:true});assert.strictEqual(json.store,'json');

  let queried='';
  const postgres=await buildReadiness({configuration:valid,store:{type:'postgres',async query(sql){queried=sql;return {rows:[{ready:1}]};}}});
  assert.strictEqual(postgres.ready,true);assert.match(queried,/SELECT 1/);

  const invalid=await buildReadiness({configuration:{ok:false,errors:['JWT_SECRET must be at least 32 characters'],warnings:[]},store:{type:'json',read(){return {};}}});
  assert.strictEqual(invalid.ready,false);assert.strictEqual(invalid.checks.configuration,false);assert.ok(invalid.issues.some(issue=>issue.includes('JWT_SECRET')));
  assert.strictEqual(readinessHttpStatus(json),200);assert.strictEqual(readinessHttpStatus(invalid),503);

  const unavailable=await buildReadiness({configuration:valid,store:{type:'json',read(){throw new Error('sensitive connection detail');}}});
  assert.strictEqual(unavailable.ready,false);assert.strictEqual(unavailable.checks.dataStore,false);assert.deepStrictEqual(unavailable.issues,['Data store check failed']);assert.ok(!JSON.stringify(unavailable).includes('sensitive connection detail'));
  console.log('Sprint 733 real readiness test passed.');
})().catch(error=>{console.error(error);process.exit(1);});
