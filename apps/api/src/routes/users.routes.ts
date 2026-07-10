export const userRoutes = [
  { method: 'GET', path: '/users/me', permission: 'users.self.read' },
  { method: 'GET', path: '/tenants/:tenantId/users', permission: 'users.read' },
  { method: 'POST', path: '/tenants/:tenantId/users', permission: 'users.create' },
  { method: 'PATCH', path: '/tenants/:tenantId/users/:userId', permission: 'users.update' },
  { method: 'DELETE', path: '/tenants/:tenantId/users/:userId', permission: 'users.delete' }
] as const;
