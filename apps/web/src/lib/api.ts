// ServicePro API client for web app
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

function getToken(): string {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem('sp_token') || '';
}

function getTenantId(): string {
  if (typeof window === 'undefined') return 'tenant_demo';
  return localStorage.getItem('sp_tenant_id') || 'tenant_demo';
}

export async function api<T = unknown>(method: string, path: string, body?: unknown): Promise<{ data?: T; error?: { code: string; message: string } }> {
  const headers: Record<string, string> = {
    'content-type': 'application/json',
    'x-tenant-id': getTenantId(),
  };
  const token = getToken();
  if (token) headers['authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const json = await res.json().catch(() => ({}));
  if (!res.ok) return { error: json.error || { code: 'request_failed', message: `Status ${res.status}` } };
  return json;
}

// Dispatch
export const dispatchApi = {
  list: () => api('GET', '/api/v1/dispatch'),
  assign: (data: { jobId: string; technicianId: string }) => api('POST', '/api/v1/dispatch', data),
  updateStatus: (id: string, status: string) => api('PATCH', `/api/v1/dispatch/${id}/status`, { status }),
};

// CRM
export const crmApi = {
  listLeads: (params?: string) => api('GET', `/api/v1/crm/leads${params ? '?' + params : ''}`),
  createLead: (data: Record<string, unknown>) => api('POST', '/api/v1/crm/leads', data),
  updateLead: (id: string, data: Record<string, unknown>) => api('PATCH', `/api/v1/crm/leads/${id}`, data),
  deleteLead: (id: string) => api('DELETE', `/api/v1/crm/leads/${id}`),
  pipeline: () => api('GET', '/api/v1/crm/pipeline'),
};

// Invoices & Payments
export const financeApi = {
  listInvoices: () => api('GET', '/api/v1/invoices'),
  listPayments: () => api('GET', '/api/v1/payments'),
  createPayment: (data: { invoiceId: string; amountCents: number; method?: string }) => api('POST', '/api/v1/payments', data),
};

// Inventory
export const inventoryApi = {
  list: () => api('GET', '/api/v1/inventory'),
  create: (data: Record<string, unknown>) => api('POST', '/api/v1/inventory', data),
};

// Marketing
export const marketingApi = {
  listCampaigns: () => api('GET', '/api/v1/marketing/campaigns'),
  createCampaign: (data: Record<string, unknown>) => api('POST', '/api/v1/marketing/campaigns', data),
  updateCampaign: (id: string, data: Record<string, unknown>) => api('PATCH', `/api/v1/marketing/campaigns/${id}`, data),
  sendCampaign: (id: string) => api('POST', `/api/v1/marketing/campaigns/${id}/send`),
  stats: () => api('GET', '/api/v1/marketing/stats'),
};

// Technicians
export const technicianApi = {
  list: () => api('GET', '/api/v1/technicians'),
};

// Jobs
export const jobsApi = {
  list: () => api('GET', '/api/v1/jobs'),
  create: (data: Record<string, unknown>) => api('POST', '/api/v1/jobs', data),
  update: (id: string, data: Record<string, unknown>) => api('PATCH', `/api/v1/jobs/${id}`, data),
};

// Customers
export const customersApi = {
  list: () => api('GET', '/api/v1/customers'),
  create: (data: Record<string, unknown>) => api('POST', '/api/v1/customers', data),
};
