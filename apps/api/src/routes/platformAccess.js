const {sendJson}=require('../utils/http');
const {issueOpaqueToken,hashToken}=require('../services/tokenService');
const {isPlatformAdmin,platformAdminEmails}=require('../services/platformAdminService');
const {passwordErrors}=require('./auth');
const {normalizeModules}=require('../services/moduleAccessService');
function deny(res){return sendJson(res,403,{error:{code:'forbidden',message:'Platform administrator access required'}});}
async function eligibleOwners(req){
  const admins=new Set(platformAdminEmails());
  const owners=(await req.context.repositories.accessEntitlements.listOwners()).filter(owner=>!admins.has(String(owner.email||'').trim().toLowerCase()));
  const catalog=await req.context.repositories.serviceMarketplace.listCatalog();
  const packs=new Set(catalog.filter(item=>item.itemType==='service_pack').map(item=>item.id));
  return Promise.all(owners.map(async owner=>{
    const installations=await req.context.repositories.serviceMarketplace.listInstallations(owner.tenantId);
    return {...owner,siteTypeItemId:installations.find(row=>row.status==='active'&&packs.has(row.itemId))?.itemId||''};
  }));
}
async function list(req,res){if(!isPlatformAdmin(req))return deny(res);return sendJson(res,200,{data:await eligibleOwners(req)});}
async function createOwner(req,res){
  if(!isPlatformAdmin(req))return deny(res);
  const {tenantId,email,name,password}=req.body||{};
  const errors=passwordErrors(password);
  if(!tenantId||!email||!name||errors.length)return sendJson(res,400,{error:{code:'validation_failed',message:errors.length?`Password must include ${errors.join(', ')}`:'Tenant, name, email, and password are required'}});
  if(platformAdminEmails().includes(String(email).trim().toLowerCase()))return sendJson(res,400,{error:{code:'invalid_owner',message:'Platform administrators cannot be created as tenant owners'}});
  const catalog=await req.context.repositories.serviceMarketplace.listCatalog();
  const siteType=catalog.find(item=>item.id===req.body.siteTypeItemId&&item.itemType==='service_pack');
  if(req.body.siteTypeItemId&&!siteType)return sendJson(res,400,{error:{code:'invalid_site_type',message:'Select a valid service-company site type from the marketplace'}});
  const user=await req.context.repositories.users.create({tenantId,email:String(email).trim().toLowerCase(),name,password,roles:['owner']});
  if(!user)return sendJson(res,409,{error:{code:'account_exists',message:'An account already exists for this tenant and email'}});
  const modules=normalizeModules(req.body.modules);
  await req.context.repositories.moduleAccess.setTenantModules(tenantId,modules,req.context.userId);
  if(siteType)await req.context.repositories.serviceMarketplace.install(tenantId,{itemId:siteType.id,installedBy:req.context.userId});
  return sendJson(res,201,{data:{...user,enabledModules:modules,siteTypeItemId:siteType?.id||''}});
}
async function setSiteType(req,res,tenantId){
  if(!isPlatformAdmin(req))return deny(res);
  const catalog=await req.context.repositories.serviceMarketplace.listCatalog();
  const packs=catalog.filter(item=>item.itemType==='service_pack');
  const selected=packs.find(item=>item.id===req.body.itemId);
  if(!selected)return sendJson(res,400,{error:{code:'invalid_site_type',message:'Select a valid service-company site type from the marketplace'}});
  const installations=await req.context.repositories.serviceMarketplace.listInstallations(tenantId);
  const packIds=new Set(packs.map(item=>item.id));
  for(const row of installations)if(packIds.has(row.itemId)&&row.itemId!==selected.id)await req.context.repositories.serviceMarketplace.uninstall(tenantId,row.id);
  const installation=await req.context.repositories.serviceMarketplace.install(tenantId,{itemId:selected.id,installedBy:req.context.userId});
  return sendJson(res,200,{data:{tenantId,siteType:selected,installation}});
}
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
module.exports={list,createOwner,setSiteType,issue,redeem,update,eligibleOwners};
