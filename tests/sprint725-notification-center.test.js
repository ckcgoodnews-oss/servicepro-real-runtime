const assert = require('assert');
const fs = require('fs'); const path = require('path');
const { createNotificationRepository } = require('../apps/api/src/repositories/notificationRepository');

let state={notifications:[]};const store={type:'json',read:()=>structuredClone(state),write:data=>{state=structuredClone(data);}};const notifications=createNotificationRepository(store);
const first=notifications.create('tenant_a',{channel:'email',toAddress:'owner@example.com',subject:'Dispatch changed',body:'A technician was reassigned.',status:'sent'});
notifications.create('tenant_a',{channel:'push',toAddress:'tech@example.com',subject:'New job',body:'A new job is ready.',status:'sent'});
notifications.create('tenant_b',{channel:'email',toAddress:'owner@example.com',subject:'Other tenant',body:'Private.',status:'sent'});
assert.strictEqual(notifications.list('tenant_a',{toAddress:'owner@example.com'}).length,1);
assert.strictEqual(notifications.list('tenant_b',{toAddress:'tech@example.com'}).length,0);
assert.ok(notifications.markRead('tenant_a',first.id,'owner@example.com').readAt);
assert.strictEqual(notifications.markRead('tenant_a',first.id,'tech@example.com'),null);
assert.strictEqual(notifications.markAllRead('tenant_a','tech@example.com'),1);

const read=file=>fs.readFileSync(path.join(__dirname,'..',file),'utf8');const component=read('apps/web/src/components/NotificationsWorkspace.tsx');
for(const label of ['Inbox','Mark all read','Email','Browser push','Save preferences'])assert.match(component,new RegExp(label));
assert.match(read('apps/web/src/components/ToastRegion.tsx'),/aria-live="polite"/);assert.match(read('packages/database/postgres/725_notification_center.sql'),/read_at/);assert.match(read('apps/api/src/router.js'),/notifications\/read-all/);
console.log('Sprint 725 notification center test passed.');
