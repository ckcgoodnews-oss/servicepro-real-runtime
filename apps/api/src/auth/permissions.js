const fs = require('fs');
const path = require('path');

function permissionValue(name) {
  return name.toLowerCase().replace(/_+/g, '.');
}

function discoverPermissionNames() {
  const names = new Set(['USERS_SELF_READ']);
  const roots = [path.join(__dirname, '..', 'routes'), path.join(__dirname, '..', 'router.js')];
  const files = [];
  for (const root of roots) {
    if (!fs.existsSync(root)) continue;
    const stat = fs.statSync(root);
    if (stat.isDirectory()) {
      for (const file of fs.readdirSync(root)) if (file.endsWith('.js')) files.push(path.join(root, file));
    } else files.push(root);
  }
  for (const file of files) {
    const source = fs.readFileSync(file, 'utf8');
    for (const match of source.matchAll(/PERMISSIONS\.([A-Z0-9_]+)/g)) names.add(match[1]);
  }
  return [...names].sort();
}

const PERMISSIONS = Object.freeze(Object.fromEntries(discoverPermissionNames().map(name => [name, permissionValue(name)])));

const ROLE_PRESETS = {
  owner: Object.values(PERMISSIONS),
  admin: Object.values(PERMISSIONS),
  manager: Object.values(PERMISSIONS).filter(value => !value.endsWith('.delete') && value !== 'tenant.settings.write'),
  technician: Object.values(PERMISSIONS).filter(value => /^(users\.self\.read|jobs\.|schedule\.|dispatch\.|inventory\.read|materials\.|checklists\.|media\.|knowledge\.read|workflows\.transition)/.test(value)),
  billing: Object.values(PERMISSIONS).filter(value => /^(users\.self\.read|customers\.read|estimates\.|invoices\.|payments\.|reports\.|exports\.|privacy\.read)/.test(value)),
  read_only: Object.values(PERMISSIONS).filter(value => value.endsWith('.read'))
};

function permissionsForRoles(roles = []) {
  const set = new Set();
  for (const role of roles) for (const permission of ROLE_PRESETS[role] || []) set.add(permission);
  return [...set];
}

function hasPermission(context, permission) {
  return Array.isArray(context.permissions) && context.permissions.includes(permission);
}

module.exports = { PERMISSIONS, ROLE_PRESETS, permissionsForRoles, hasPermission, discoverPermissionNames };
