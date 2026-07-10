import { Permission } from './permissions';

export type Principal = {
  userId: string;
  tenantId: string;
  roles: string[];
  permissions: Permission[];
};

export function hasPermission(principal: Principal, permission: Permission): boolean {
  return principal.permissions.includes(permission);
}

export function requirePermission(principal: Principal, permission: Permission): void {
  if (!hasPermission(principal, permission)) {
    throw new Error(`Forbidden: missing permission ${permission}`);
  }
}
