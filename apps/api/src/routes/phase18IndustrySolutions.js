const { sendJson } = require('../utils/http');
function repository(req) { return req.context.repositories.phase18IndustrySolutions; }
function wrap(value,res,status=200) { Promise.resolve(value).then(data=>sendJson(res,status,{data})).catch(error=>sendJson(res,error.status||500,{error:{code:error.code||'error',message:error.message}})); }
function dispatch(req,res) {
  const match=req.url.match(/\/api\/v1\/industry-solutions\/([^/?]+)(?:\/([^/?]+))?(?:\/([^/?]+))?/);
  if(!match)return false;
  const domain=match[1],id=match[2]||'',action=match[3]||'';
  if(domain==='metrics'&&req.method==='GET'){wrap(repository(req).metrics(req.context.tenantId||''),res);return true;}
  if(!id&&req.method==='POST'){wrap(repository(req).create({...req.body,tenantId:req.body.tenantId||req.context.tenantId||'',domain}),res,201);return true;}
  if(!id&&req.method==='GET'){wrap(repository(req).list({tenantId:req.context.tenantId||'',domain}),res);return true;}
  if(id&&!action&&req.method==='GET'){wrap(repository(req).get(id),res);return true;}
  if(id&&action&&req.method==='POST'){wrap(repository(req).transition(id,action),res);return true;}
  return false;
}
module.exports={dispatch};
