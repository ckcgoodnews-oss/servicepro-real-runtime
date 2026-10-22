const DEFAULT_PLATFORM_ADMIN_EMAILS = Object.freeze([
  'cphillips@aardvark-enterprises.net',
  'admin1914@aardvark-enterprises.net',
  '5189213@gmail.com'
]);

function normalizeEmail(value) {
  return String(value || '')
    .trim()
    .replace(/^['"]|['"]$/g, '')
    .toLowerCase();
}

function platformAdminEmails() {
  const configured = String(process.env.PLATFORM_ADMIN_EMAILS || '')
    .replace(/^PLATFORM_ADMIN_EMAILS=/i, '')
    .split(',')
    .map(normalizeEmail)
    .filter(Boolean);
  return [...new Set([...DEFAULT_PLATFORM_ADMIN_EMAILS, ...configured])];
}

function isPlatformAdmin(req) {
  if (typeof req.context.platformAdmin === 'boolean') return req.context.platformAdmin;
  return platformAdminEmails().includes(normalizeEmail(req.context.email));
}

function isBootstrapAdmin(user) {
  return user.tenantId === (process.env.DEFAULT_TENANT_ID || 'tenant_demo') && platformAdminEmails().includes(normalizeEmail(user.email));
}

module.exports = {DEFAULT_PLATFORM_ADMIN_EMAILS, platformAdminEmails, isPlatformAdmin, isBootstrapAdmin};
