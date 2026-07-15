const { sendJson } = require('../utils/http');

function sameDay(value, today = new Date()) {
  const date = new Date(value); return !Number.isNaN(date.valueOf()) && date.toISOString().slice(0,10) === today.toISOString().slice(0,10);
}

async function summary(req, res) {
  const tenantId = req.context.tenantId; const repositories = req.context.repositories;
  const [jobs,appointments,customers,invoices,notifications,activity] = await Promise.all([
    repositories.jobs.list(tenantId), repositories.appointments.list(tenantId), repositories.customers.list(tenantId),
    repositories.invoices.list(tenantId), repositories.notifications.list(tenantId), repositories.audit.list(tenantId,8)
  ]);
  const customerNames = new Map(customers.map(row => [row.id, `${row.firstName || ''} ${row.lastName || ''}`.trim()]));
  const openJobs = jobs.filter(row => !['completed','cancelled','closed'].includes(String(row.status).toLowerCase()));
  const priorityRank = { urgent:0, high:1, normal:2, low:3 };
  const attention = openJobs.slice().sort((a,b) => (priorityRank[a.priority] ?? 9) - (priorityRank[b.priority] ?? 9)).slice(0,5).map(row => ({ id:row.id,title:row.title,status:row.status,priority:row.priority,customer:customerNames.get(row.customerId) || 'Unassigned customer',updatedAt:row.updatedAt }));
  const recentWork = jobs.slice().sort((a,b) => Date.parse(b.updatedAt || b.createdAt) - Date.parse(a.updatedAt || a.createdAt)).slice(0,5).map(row => ({ id:row.id,title:row.title,status:row.status,priority:row.priority,customer:customerNames.get(row.customerId) || 'Unassigned customer',updatedAt:row.updatedAt || row.createdAt }));
  return sendJson(res,200,{ data:{ generatedAt:new Date().toISOString(), kpis:{ openWork:openJobs.length,appointmentsToday:appointments.filter(row => sameDay(row.startTime)).length,customers:customers.length,outstanding:invoices.reduce((sum,row) => sum + Number(row.balanceDue || 0),0) }, attention,recentWork,notifications:notifications.slice(0,5).map(row => ({id:row.id,subject:row.subject || row.templateKey || 'Notification',status:row.status,createdAt:row.createdAt})),activity:activity.slice(0,5).map(row => ({id:row.id,eventType:row.eventType,action:row.action,entityType:row.entityType,createdAt:row.createdAt})) } });
}

module.exports = { summary, sameDay };
