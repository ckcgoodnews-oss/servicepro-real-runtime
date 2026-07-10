export const adminRoutes = [
  { path: '/admin', label: 'Dashboard', permission: 'dashboard.view' },
  { path: '/admin/customers', label: 'Customers', permission: 'customers.read' },
  { path: '/admin/jobs', label: 'Jobs', permission: 'jobs.read' },
  { path: '/admin/dispatch', label: 'Dispatch', permission: 'jobs.read' },
  { path: '/admin/estimates', label: 'Estimates', permission: 'estimates.read' },
  { path: '/admin/invoices', label: 'Invoices', permission: 'invoices.read' },
  { path: '/admin/inventory', label: 'Inventory', permission: 'inventory.read' },
  { path: '/admin/reports', label: 'Reports', permission: 'reports.view' },
  { path: '/admin/settings', label: 'Settings', permission: 'settings.read' }
] as const;
