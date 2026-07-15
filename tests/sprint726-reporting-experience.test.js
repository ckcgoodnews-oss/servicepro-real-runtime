const assert=require('assert');const fs=require('fs');const path=require('path');
const {createReportScheduleRepository}=require('../apps/api/src/repositories/reportScheduleRepository');
let state={reportSchedules:[]};const store={type:'json',read:()=>structuredClone(state),write:data=>{state=structuredClone(data);}};const schedules=createReportScheduleRepository(store);
const row=schedules.create('tenant_a',{reportKey:'revenue',frequency:'weekly',recipients:['owner@example.com'],nextRunAt:'2026-07-20T13:00:00.000Z'});
assert.strictEqual(schedules.list('tenant_a').length,1);assert.strictEqual(schedules.list('tenant_b').length,0);assert.strictEqual(schedules.findById('tenant_b',row.id),null);
assert.strictEqual(schedules.update('tenant_a',row.id,{active:false}).active,false);assert.throws(()=>schedules.create('tenant_a',{reportKey:'unknown',recipients:['a@example.com']}),/supported report/);assert.strictEqual(schedules.remove('tenant_b',row.id),false);
const read=file=>fs.readFileSync(path.join(__dirname,'..',file),'utf8');const component=read('apps/web/src/components/ReportsWorkspace.tsx');for(const label of ['Work order pipeline','Revenue position','Export dashboard','Scheduled delivery','Create schedule'])assert.match(component,new RegExp(label));assert.match(read('apps/api/src/router.js'),/REPORTS_WRITE/);assert.match(read('packages/database/postgres/726_reporting_experience.sql'),/report_schedules/);
console.log('Sprint 726 reporting experience test passed.');
