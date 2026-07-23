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
  return platformAdminEmails().includes(normalizeEmail(req.context.email));
}

module.exports = {DEFAULT_PLATFORM_ADMIN_EMAILS, platformAdminEmails, isPlatformAdmin};
