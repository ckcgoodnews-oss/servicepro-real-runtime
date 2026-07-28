// Re-export authFetch-based API helpers for backward compatibility.
// Components should prefer importing directly from '@/auth/session'.
import { authFetch } from '@/auth/session';

export async function api<T = unknown>(method: string, path: string, body?: unknown): Promise<{ data?: T; error?: { code: string; message: string } }> {
  const response = await authFetch(path, {
    method,
    body: body ? JSON.stringify(body) : undefined,
  });
  const json = await response.json().catch(() => ({}));
  if (!response.ok) return { error: json.error || { code: 'request_failed', message: `Status ${response.status}` } };
  return json;
}

export const dispatchApi = {
  list: () => api('GET', '/api/v1/dispatch'),
  assign: (data: { jobId: string; technicianId: string }) => api('POST', '/api/v1/dispatch', data),
  updateStatus: (id: string, status: string) => api('PATCH', `/api/v1/dispatch/${id}/status`, { status }),
};

export const crmApi = {
  listLeads: (params?: string) => api('GET', `/api/v1/crm/leads${params ? '?' + params : ''}`),
  createLead: (data: Record<string, unknown>) => api('POST', '/api/v1/crm/leads', data),
  updateLead: (id: string, data: Record<string, unknown>) => api('PATCH', `/api/v1/crm/leads/${id}`, data),
  deleteLead: (id: string) => api('DELETE', `/api/v1/crm/leads/${id}`),
  pipeline: () => api('GET', '/api/v1/crm/pipeline'),
};

export const financeApi = {
  listInvoices: () => api('GET', '/api/v1/invoices'),
  listPayments: () => api('GET', '/api/v1/payments'),
  createPayment: (data: { invoiceId: string; amountCents: number; method?: string }) => api('POST', '/api/v1/payments', data),
};

export const inventoryApi = {
  list: () => api('GET', '/api/v1/inventory'),
  create: (data: Record<string, unknown>) => api('POST', '/api/v1/inventory', data),
};

export const marketingApi = {
  listCampaigns: () => api('GET', '/api/v1/marketing/campaigns'),
  createCampaign: (data: Record<string, unknown>) => api('POST', '/api/v1/marketing/campaigns', data),
  updateCampaign: (id: string, data: Record<string, unknown>) => api('PATCH', `/api/v1/marketing/campaigns/${id}`, data),
  sendCampaign: (id: string) => api('POST', `/api/v1/marketing/campaigns/${id}/send`),
  stats: () => api('GET', '/api/v1/marketing/stats'),
};

export const technicianApi = {
  list: () => api('GET', '/api/v1/technicians'),
};

export const jobsApi = {
  list: () => api('GET', '/api/v1/jobs'),
  create: (data: Record<string, unknown>) => api('POST', '/api/v1/jobs', data),
  update: (id: string, data: Record<string, unknown>) => api('PATCH', `/api/v1/jobs/${id}`, data),
};

export const customersApi = {
  list: () => api('GET', '/api/v1/customers'),
  create: (data: Record<string, unknown>) => api('POST', '/api/v1/customers', data),
};

export const knowledgeApi = {
  list: () => api('GET', '/api/v1/knowledge'),
  create: (data: Record<string, unknown>) => api('POST', '/api/v1/knowledge', data),
  update: (id: string, data: Record<string, unknown>) => api('PATCH', `/api/v1/knowledge/${id}`, data),
  remove: (id: string) => api('DELETE', `/api/v1/knowledge/${id}`),
};

export const estimatesApi = {
  list: () => api('GET', '/api/v1/estimates'),
  create: (data: Record<string, unknown>) => api('POST', '/api/v1/estimates', data),
  update: (id: string, data: Record<string, unknown>) => api('PATCH', `/api/v1/estimates/${id}`, data),
};

export const automationApi = {
  listRules: () => api('GET', '/api/v1/workflows'),
  createRule: (data: Record<string, unknown>) => api('POST', '/api/v1/workflows', data),
  updateRule: (id: string, data: Record<string, unknown>) => api('PATCH', `/api/v1/workflows/${id}`, data),
  deleteRule: (id: string) => api('DELETE', `/api/v1/workflows/${id}`),
};
