export type ApiRouteDefinition = {
  method: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  path: string;
  permission?: string;
  tenantScoped: boolean;
  description: string;
};

export const API_ROUTES: ApiRouteDefinition[] = [
  { method: 'GET', path: '/api/v1/customers', permission: 'customers.read', tenantScoped: true, description: 'List customers.' },
  { method: 'POST', path: '/api/v1/customers', permission: 'customers.write', tenantScoped: true, description: 'Create customer.' },
  { method: 'GET', path: '/api/v1/customers/:id', permission: 'customers.read', tenantScoped: true, description: 'Get customer.' },
  { method: 'PATCH', path: '/api/v1/customers/:id', permission: 'customers.write', tenantScoped: true, description: 'Update customer.' },
  { method: 'GET', path: '/api/v1/jobs', permission: 'jobs.read', tenantScoped: true, description: 'List jobs.' },
  { method: 'POST', path: '/api/v1/jobs', permission: 'jobs.write', tenantScoped: true, description: 'Create job.' },
  { method: 'GET', path: '/api/v1/jobs/:id', permission: 'jobs.read', tenantScoped: true, description: 'Get job.' },
  { method: 'PATCH', path: '/api/v1/jobs/:id', permission: 'jobs.write', tenantScoped: true, description: 'Update job.' },
  { method: 'GET', path: '/api/v1/estimates', permission: 'estimates.read', tenantScoped: true, description: 'List estimates.' },
  { method: 'POST', path: '/api/v1/estimates', permission: 'estimates.write', tenantScoped: true, description: 'Create estimate.' },
  { method: 'GET', path: '/api/v1/invoices', permission: 'invoices.read', tenantScoped: true, description: 'List invoices.' },
  { method: 'POST', path: '/api/v1/invoices', permission: 'invoices.write', tenantScoped: true, description: 'Create invoice.' }
];
