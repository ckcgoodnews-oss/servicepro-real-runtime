const { sendJson } = require('../utils/http');
const { PERMISSIONS, hasPermission } = require('../auth/permissions');
function repository(req) { return req.context.repositories.phase40HyperautomationEnterpriseOrchestration; }
function wrap(value,res,status=200) { Promise.resolve(value).then(data=>sendJson(res,status,{data})).catch(error=>sendJson(res,error.status||500,{error:{code:error.code||'error',message:error.message}})); }
function allowed(req, permission) { return !req.context.permissions || hasPermission(req.context, permission); }
function dispatch(req,res) {
  const match=req.url.match(/\/api\/v1\/hyperautomation-enterprise-orchestration\/([^/?]+)(?:\/([^/?]+))?(?:\/([^/?]+))?/);
  if(!match)return false;
  if(!allowed(req, req.method==='GET' ? PERMISSIONS.HYPERAUTOMATION_ENTERPRISE_ORCHESTRATION_READ : PERMISSIONS.HYPERAUTOMATION_ENTERPRISE_ORCHESTRATION_WRITE)){sendJson(res,403,{error:{code:'forbidden',message:'Permission denied'}});return true;}
  const domain=match[1],id=match[2]||'',action=match[3]||'';
  if(domain==='metrics'&&req.method==='GET'){wrap(repository(req).metrics(req.context.tenantId||''),res);return true;}
  if(domain==='release-ready'&&req.method==='GET'){wrap(repository(req).releaseReady(req.context.tenantId||''),res);return true;}
  if(!id&&req.method==='POST'){wrap(repository(req).create({...req.body,tenantId:req.body.tenantId||req.context.tenantId||'',domain}),res,201);return true;}
  if(!id&&req.method==='GET'){wrap(repository(req).list({tenantId:req.context.tenantId||'',domain}),res);return true;}
  if(id&&!action&&req.method==='GET'){wrap(repository(req).get(id),res);return true;}
  if(id&&action&&req.method==='POST'){wrap(repository(req).transition(id,action),res);return true;}
  return false;
}
module.exports={dispatch};
