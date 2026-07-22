const {sendJson}=require('../utils/http');
const {isPlatformAdmin}=require('../services/platformAdminService');
async function ownerAccessGuard(req,res){
  if(isPlatformAdmin(req)||!(req.context.roles||[]).includes('owner'))return true;
  const row=await req.context.repositories.accessEntitlements.current(req.context.tenantId,req.context.userId);
  if(!row)return true;
  if(row.status==='active'&&Date.parse(row.expiresAt)>Date.now())return true;
  sendJson(res,402,{error:{code:'owner_access_required',message:'Owner access is inactive or expired',details:{status:row.status,expiresAt:row.expiresAt}}});
  return false;
}
module.exports={ownerAccessGuard};
