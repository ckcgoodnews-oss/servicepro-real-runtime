const assert = require('assert');
const fs = require('fs');
const path = require('path');
const dashboard = require('../apps/api/src/routes/dashboard');

function response() { return { setHeader(){}, end(raw){ this.body=JSON.parse(raw); } }; }

(async () => {
  const now=new Date(); const today=new Date(now.getTime()+60000).toISOString(); const yesterday=new Date(now.getTime()-86400000).toISOString();
  assert.equal(dashboard.sameDay(today,now),true); assert.equal(dashboard.sameDay(yesterday,now),false);
  const req={context:{tenantId:'tenant_a',repositories:{
    jobs:{list:async()=>[{id:'j1',customerId:'c1',title:'Main line leak',status:'open',priority:'urgent',updatedAt:today},{id:'j2',customerId:'c1',title:'Completed',status:'completed',priority:'normal',updatedAt:yesterday}]},
    appointments:{list:async()=>[{id:'a1',startTime:today},{id:'a2',startTime:yesterday}]},
    customers:{list:async()=>[{id:'c1',firstName:'Maria',lastName:'Johnson'}]},
    invoices:{list:async()=>[{balanceDue:125.5},{balanceDue:74.5}]},
    notifications:{list:async()=>[{id:'n1',subject:'Customer replied',status:'queued',createdAt:today}]},
    audit:{list:async()=>[{id:'e1',eventType:'job.updated',action:'update',entityType:'job',createdAt:today}]}
  }}};
  const res=response(); await dashboard.summary(req,res); const data=res.body.data;
  assert.deepStrictEqual(data.kpis,{openWork:1,appointmentsToday:1,customers:1,outstanding:200});
  assert.equal(data.attention[0].customer,'Maria Johnson'); assert.equal(data.recentWork.length,2); assert.equal(data.notifications.length,1); assert.equal(data.activity.length,1);
  const root=path.resolve(__dirname,'..'); const component=fs.readFileSync(path.join(root,'apps/web/src/components/DashboardOverview.tsx'),'utf8'); const router=fs.readFileSync(path.join(root,'apps/api/src/router.js'),'utf8');
  assert.match(component,/dashboard\/summary/); assert.match(component,/Needs attention/); assert.match(component,/Quick actions/); assert.match(component,/Recent work/); assert.match(component,/Activity & notifications/); assert.match(router,/\/api\/v1\/dashboard\/summary/);
  console.log('Sprint 718 live dashboard test passed.');
})().catch(error=>{console.error(error);process.exit(1);});
