const {sendJson}=require('../utils/http');
const {issueOpaqueToken,hashToken}=require('../services/tokenService');
const {isPlatformAdmin,platformAdminEmails}=require('../services/platformAdminService');
function deny(res){return sendJson(res,403,{error:{code:'forbidden',message:'Platform administrator access required'}});}
async function eligibleOwners(req){
  const admins=new Set(platformAdminEmails());
  return (await req.context.repositories.accessEntitlements.listOwners())
    .filter(owner=>!admins.has(String(owner.email||'').trim().toLowerCase()));
}
async function list(req,res){if(!isPlatformAdmin(req))return deny(res);return sendJson(res,200,{data:await eligibleOwners(req)});}
async function issue(req,res,userId){
  if(!isPlatformAdmin(req))return deny(res);
  const owner=(await eligibleOwners(req)).find(candidate=>candidate.id===userId&&candidate.tenantId===req.body.tenantId);
  if(!owner)return sendJson(res,400,{error:{code:'invalid_owner',message:'Access tokens can only be issued to tenant owners, not platform administrators'}});
  const days=Math.max(1,Math.min(3650,Number(req.body.days||30)));
  const raw=`sp_access_${issueOpaqueToken(24)}`;
  const row=await req.context.repositories.accessEntitlements.issue({tenantId:owner.tenantId,userId,tokenHash:hashToken(raw),tokenLastFour:raw.slice(-4),expiresAt:new Date(Date.now()+days*86400000).toISOString(),createdBy:req.context.userId});
  return sendJson(res,201,{data:{...row,token:raw}});
}
async function redeem(req,res){const row=await req.context.repositories.accessEntitlements.redeem(req.context.tenantId,req.context.userId,hashToken(req.body.token||''));return row?sendJson(res,200,{data:row}):sendJson(res,400,{error:{code:'invalid_access_token',message:'Access token is invalid or expired'}});}
async function update(req,res,id){if(!isPlatformAdmin(req))return deny(res);const patch={};if(req.body.status)patch.status=req.body.status;if(req.body.expiresAt)patch.expiresAt=new Date(req.body.expiresAt).toISOString();const row=await req.context.repositories.accessEntitlements.update(id,patch);return row?sendJson(res,200,{data:row}):sendJson(res,404,{error:{code:'not_found',message:'Access entitlement not found'}});}
module.exports={list,issue,redeem,update,eligibleOwners};
