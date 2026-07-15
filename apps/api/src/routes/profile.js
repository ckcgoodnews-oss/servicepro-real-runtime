const { sendJson } = require('../utils/http');
const { verifyPassword } = require('../services/passwordService');
const { issueOpaqueToken, hashToken } = require('../services/tokenService');
const { passwordErrors } = require('./auth');

const notificationDefaults = { email:true,push:true,dispatch:true,billing:true,product:false };
function safe(user) { return { id:user.id,tenantId:user.tenantId,email:user.email,name:user.name || '',avatarUrl:user.avatarUrl || '',timezone:user.timezone || 'America/Indiana/Indianapolis',locale:user.locale || 'en-US',roles:user.roles || [],mfaEnabled:Boolean(user.mfaEnabled),notificationPreferences:{...notificationDefaults,...(user.notificationPreferences || {})} }; }
async function current(req) { return req.context.repositories.users.findById(req.context.tenantId,req.context.userId); }

async function get(req,res) { const user=await current(req); return user?sendJson(res,200,{data:safe(user)}):sendJson(res,404,{error:{code:'not_found',message:'User profile not found'}}); }
async function update(req,res) {
  const user=await current(req); if(!user) return sendJson(res,404,{error:{code:'not_found',message:'User profile not found'}});
  const preferences={...notificationDefaults,...(user.notificationPreferences || {}),...(req.body.notificationPreferences || {})};
  const updated=await req.context.repositories.users.updateProfile(req.context.tenantId,req.context.userId,{name:String(req.body.name ?? user.name ?? '').trim(),avatarUrl:String(req.body.avatarUrl ?? user.avatarUrl ?? '').trim(),timezone:String(req.body.timezone ?? user.timezone ?? 'America/Indiana/Indianapolis'),locale:String(req.body.locale ?? user.locale ?? 'en-US'),notificationPreferences:preferences});
  return sendJson(res,200,{data:safe(updated)});
}
async function changePassword(req,res) {
  const user=await current(req); if(!user || !(await verifyPassword(req.body.currentPassword,user.passwordHash))) return sendJson(res,400,{error:{code:'invalid_current_password',message:'Current password is incorrect'}});
  const errors=passwordErrors(req.body.newPassword); if(errors.length) return sendJson(res,400,{error:{code:'weak_password',message:`Password must include ${errors.join(', ')}`}});
  await req.context.repositories.users.updatePassword(req.context.tenantId,req.context.userId,req.body.newPassword); await req.context.repositories.authSessions.revokeForUser(req.context.tenantId,req.context.userId);
  return sendJson(res,200,{data:{changed:true,reloginRequired:true}});
}
async function setMfa(req,res) { const row=await req.context.repositories.users.setMfaEnabled(req.context.tenantId,req.context.userId,Boolean(req.body.enabled)); return sendJson(res,200,{data:{mfaEnabled:Boolean(row?.mfaEnabled)}}); }
async function listTokens(req,res) { const rows=await req.context.repositories.users.listApiTokens(req.context.tenantId,req.context.userId); return sendJson(res,200,{data:rows.map(({tokenHash,userId,tenantId,revokedAt,...row})=>row)}); }
async function createToken(req,res) { const name=String(req.body.name || '').trim(); if(!name) return sendJson(res,400,{error:{code:'validation_failed',message:'Token name is required'}}); const raw=`sp_live_${issueOpaqueToken(24)}`; const row=await req.context.repositories.users.createApiToken({tenantId:req.context.tenantId,userId:req.context.userId,name,tokenHash:hashToken(raw),lastFour:raw.slice(-4),expiresAt:req.body.expiresAt || null}); const {tokenHash,...metadata}=row; return sendJson(res,201,{data:{...metadata,token:raw}}); }
async function revokeToken(req,res,id) { const revoked=await req.context.repositories.users.revokeApiToken(req.context.tenantId,req.context.userId,id); return revoked?sendJson(res,204,{}):sendJson(res,404,{error:{code:'not_found',message:'API token not found'}}); }

module.exports={get,update,changePassword,setMfa,listTokens,createToken,revokeToken,safe};
