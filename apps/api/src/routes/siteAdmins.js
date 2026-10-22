const {sendJson} = require('../utils/http');
const {isPlatformAdmin, isBootstrapAdmin, platformAdminEmails} = require('../services/platformAdminService');
const {passwordErrors} = require('../services/passwordPolicy');
const homeTenant = () => process.env.DEFAULT_TENANT_ID || 'tenant_demo';
const safe = user => ({id:user.id,tenantId:user.tenantId,email:user.email,name:user.name});
const deny = res => sendJson(res,403,{error:{code:'forbidden',message:'Site administrator access required'}});
const invalid = (res,message) => sendJson(res,400,{error:{code:'validation_failed',message}});
async function audit(req, action, user) {
  await req.context.repositories.audit.create(user.tenantId,{eventType:`site_admin.${action}`,actorType:'user',actorId:req.context.userId,entityType:'user',entityId:user.id,action});
}
async function list(req,res) {
  if (!isPlatformAdmin(req)) return deny(res);
  const repos = req.context.repositories;
  const users = new Map();
  for (const row of await repos.siteAdmin.list()) {
    const user = await repos.users.findById(row.tenantId,row.userId);
    if (user) users.set(`${user.tenantId}:${user.id}`,{...safe(user),protected:isBootstrapAdmin(user)});
  }
  for (const email of platformAdminEmails()) {
    const user = await repos.users.findByEmail(homeTenant(),email);
    if (user) users.set(`${user.tenantId}:${user.id}`,{...safe(user),protected:true});
  }
  return sendJson(res,200,{data:[...users.values()]});
}
async function grant(req,res) {
  if (!isPlatformAdmin(req)) return deny(res);
  const email = String(req.body?.email || '').trim().toLowerCase();
  const tenantId = homeTenant();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return invalid(res,'A valid email address is required');
  const repos = req.context.repositories;
  let user = await repos.users.findByEmail(tenantId,email);
  let created = false;
  if (!user) {
    const name = String(req.body?.name || '').trim();
    const errors = passwordErrors(req.body?.password);
    if (!name || errors.length) return invalid(res,errors.length ? `Password must include ${errors.join(', ')}` : 'Name is required');
    user = await repos.users.create({tenantId,email,name,password:req.body.password,roles:['admin']});
    if (!user) return sendJson(res,409,{error:{code:'account_exists',message:'Account changed; refresh and try again'}});
    created = true;
  }
  if (user.status && user.status !== 'active') return invalid(res,'Activate the account before granting site access');
  await repos.siteAdmin.grant({tenantId,userId:user.id,grantedBy:req.context.userId});
  await audit(req,'granted',user);
  return sendJson(res,created ? 201 : 200,{data:{...safe(user),protected:isBootstrapAdmin(user),created}});
}
async function revoke(req,res,userId) {
  if (!isPlatformAdmin(req)) return deny(res);
  const repos = req.context.repositories;
  const user = await repos.users.findById(homeTenant(),userId);
  if (!user || !(await repos.siteAdmin.has(user.tenantId,user.id))) return sendJson(res,404,{error:{code:'not_found',message:'Site administrator not found'}});
  if (isBootstrapAdmin(user) || (user.id === req.context.userId && user.tenantId === req.context.authTenantId)) return invalid(res,'You cannot remove your own access or a protected recovery administrator');
  await repos.siteAdmin.revoke(user.tenantId,user.id);
  await repos.authSessions.revokeForUser(user.tenantId,user.id);
  await audit(req,'revoked',user);
  return sendJson(res,200,{data:{...safe(user),revoked:true}});
}
async function resetPassword(req,res,userId) {
  if (!isPlatformAdmin(req)) return deny(res);
  const repos = req.context.repositories;
  const user = await repos.users.findById(homeTenant(),userId);
  if (!user || !(isBootstrapAdmin(user) || await repos.siteAdmin.has(user.tenantId,user.id))) return sendJson(res,404,{error:{code:'not_found',message:'Site administrator not found'}});
  const errors = passwordErrors(req.body?.password);
  if (errors.length) return invalid(res,`Password must include ${errors.join(', ')}`);
  await repos.users.updatePassword(user.tenantId,user.id,req.body.password);
  await repos.authSessions.revokeForUser(user.tenantId,user.id);
  await audit(req,'password_reset',user);
  return sendJson(res,200,{data:{...safe(user),passwordReset:true}});
}
module.exports = {list,grant,revoke,resetPassword};
