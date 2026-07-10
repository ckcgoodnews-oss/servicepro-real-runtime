const PERMISSIONS = { USERS_SELF_READ: 'users.self.read', PRIVACY_READ: 'privacy.read', PRIVACY_WRITE: 'privacy.write' };
const ROLE_PRESETS = { owner: Object.values(PERMISSIONS), manager: Object.values(PERMISSIONS), technician: [PERMISSIONS.USERS_SELF_READ], billing: [PERMISSIONS.USERS_SELF_READ, PERMISSIONS.PRIVACY_READ] };
function permissionsForRoles(roles = []) { const set = new Set(); for (const role of roles) for (const p of ROLE_PRESETS[role] || []) set.add(p); return Array.from(set); }
function hasPermission(context, permission) { return Array.isArray(context.permissions) && context.permissions.includes(permission); }
module.exports = { PERMISSIONS, ROLE_PRESETS, permissionsForRoles, hasPermission };
