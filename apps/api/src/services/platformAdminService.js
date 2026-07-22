function platformAdminEmails(){return String(process.env.PLATFORM_ADMIN_EMAILS||'').split(',').map(x=>x.trim().toLowerCase()).filter(Boolean);}
function isPlatformAdmin(req){return platformAdminEmails().includes(String(req.context.email||'').toLowerCase());}
module.exports={platformAdminEmails,isPlatformAdmin};
