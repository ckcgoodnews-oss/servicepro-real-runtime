function enforceHttps(req,res,next){
  if(process.env.ENFORCE_HTTPS !== 'true') return next();
  if(req.secure || req.headers['x-forwarded-proto'] === 'https') return next();
  return res.redirect(301, `https://${req.headers.host}${req.originalUrl}`);
}
module.exports={enforceHttps};
