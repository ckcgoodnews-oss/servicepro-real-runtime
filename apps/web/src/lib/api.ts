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

// Wave 1-9 APIs
export const dealsApi = {
  list: (params?: string) => api('GET', `/api/v1/deals${params ? '?' + params : ''}`),
  get: (id: string) => api('GET', `/api/v1/deals/${id}`),
  create: (data: Record<string, unknown>) => api('POST', '/api/v1/deals', data),
  update: (id: string, data: Record<string, unknown>) => api('PATCH', `/api/v1/deals/${id}`, data),
  remove: (id: string) => api('DELETE', `/api/v1/deals/${id}`),
  forecast: () => api('GET', '/api/v1/deals/forecast'),
  listPipelines: () => api('GET', '/api/v1/deals/pipelines'),
  createPipeline: (data: Record<string, unknown>) => api('POST', '/api/v1/deals/pipelines', data),
  listProducts: (id: string) => api('GET', `/api/v1/deals/${id}/products`),
  addProduct: (id: string, data: Record<string, unknown>) => api('POST', `/api/v1/deals/${id}/products`, data),
};

export const contactsApi = {
  list: (params?: string) => api('GET', `/api/v1/crm/contacts${params ? '?' + params : ''}`),
  get: (id: string) => api('GET', `/api/v1/crm/contacts/${id}`),
  create: (data: Record<string, unknown>) => api('POST', '/api/v1/crm/contacts', data),
  update: (id: string, data: Record<string, unknown>) => api('PATCH', `/api/v1/crm/contacts/${id}`, data),
  remove: (id: string) => api('DELETE', `/api/v1/crm/contacts/${id}`),
  count: (params?: string) => api('GET', `/api/v1/crm/contacts/count${params ? '?' + params : ''}`),
  merge: (data: { primary_id: string; duplicate_id: string }) => api('POST', '/api/v1/crm/contacts/merge', data),
};

export const ticketsApi = {
  list: (params?: string) => api('GET', `/api/v1/tickets${params ? '?' + params : ''}`),
  get: (id: string) => api('GET', `/api/v1/tickets/${id}`),
  create: (data: Record<string, unknown>) => api('POST', '/api/v1/tickets', data),
  update: (id: string, data: Record<string, unknown>) => api('PATCH', `/api/v1/tickets/${id}`, data),
  remove: (id: string) => api('DELETE', `/api/v1/tickets/${id}`),
  metrics: () => api('GET', '/api/v1/tickets/metrics'),
  listComments: (id: string) => api('GET', `/api/v1/tickets/${id}/comments`),
  addComment: (id: string, data: Record<string, unknown>) => api('POST', `/api/v1/tickets/${id}/comments`, data),
  listPipelines: () => api('GET', '/api/v1/tickets/pipelines'),
  slaPolicies: () => api('GET', '/api/v1/tickets/sla-policies'),
};

export const boardsApi = {
  list: () => api('GET', '/api/v1/boards'),
  get: (id: string) => api('GET', `/api/v1/boards/${id}`),
  create: (data: Record<string, unknown>) => api('POST', '/api/v1/boards', data),
  update: (id: string, data: Record<string, unknown>) => api('PATCH', `/api/v1/boards/${id}`, data),
  remove: (id: string) => api('DELETE', `/api/v1/boards/${id}`),
  listItems: (boardId: string, params?: string) => api('GET', `/api/v1/boards/${boardId}/items${params ? '?' + params : ''}`),
  createItem: (boardId: string, data: Record<string, unknown>) => api('POST', `/api/v1/boards/${boardId}/items`, data),
  updateItem: (itemId: string, data: Record<string, unknown>) => api('PATCH', `/api/v1/boards/items/${itemId}`, data),
  removeItem: (itemId: string) => api('DELETE', `/api/v1/boards/items/${itemId}`),
  listGroups: (boardId: string) => api('GET', `/api/v1/boards/${boardId}/groups`),
  createGroup: (boardId: string, data: Record<string, unknown>) => api('POST', `/api/v1/boards/${boardId}/groups`, data),
  listViews: (boardId: string) => api('GET', `/api/v1/boards/${boardId}/views`),
};

export const tasksApi = {
  list: (params?: string) => api('GET', `/api/v1/tasks${params ? '?' + params : ''}`),
  create: (data: Record<string, unknown>) => api('POST', '/api/v1/tasks', data),
  update: (id: string, data: Record<string, unknown>) => api('PATCH', `/api/v1/tasks/${id}`, data),
  remove: (id: string) => api('DELETE', `/api/v1/tasks/${id}`),
  overdue: () => api('GET', '/api/v1/tasks/overdue'),
  counts: () => api('GET', '/api/v1/tasks/counts'),
};

export const dashboardsApi = {
  list: () => api('GET', '/api/v1/dashboards'),
  get: (id: string) => api('GET', `/api/v1/dashboards/${id}`),
  create: (data: Record<string, unknown>) => api('POST', '/api/v1/dashboards', data),
  addWidget: (dashId: string, data: Record<string, unknown>) => api('POST', `/api/v1/dashboards/${dashId}/widgets`, data),
  widgetData: (widgetId: string) => api('GET', `/api/v1/dashboards/widgets/${widgetId}/data`),
};

export const aiInsightsApi = {
  list: (params?: string) => api('GET', `/api/v1/ai-insights${params ? '?' + params : ''}`),
  counts: () => api('GET', '/api/v1/ai-insights/counts'),
  generate: (data: { entity_type: string; entity_id: string }) => api('POST', '/api/v1/ai-insights/generate', data),
  dismiss: (id: string) => api('PATCH', `/api/v1/ai-insights/${id}`, { status: 'dismissed' }),
  actOn: (id: string) => api('PATCH', `/api/v1/ai-insights/${id}`, { status: 'acted_on' }),
};

export const searchApi = {
  search: (q: string, entityTypes?: string) => api('GET', `/api/v1/search?q=${encodeURIComponent(q)}${entityTypes ? '&entity_types=' + entityTypes : ''}`),
};

export const sequencesApi = {
  list: () => api('GET', '/api/v1/sequences'),
  create: (data: Record<string, unknown>) => api('POST', '/api/v1/sequences', data),
  enroll: (id: string, contactId: string) => api('POST', `/api/v1/sequences/${id}/enroll`, { contact_id: contactId }),
};

export const meetingsApi = {
  listPages: () => api('GET', '/api/v1/meetings/pages'),
  createPage: (data: Record<string, unknown>) => api('POST', '/api/v1/meetings/pages', data),
  listBookings: (params?: string) => api('GET', `/api/v1/meetings/bookings${params ? '?' + params : ''}`),
  book: (pageId: string, data: Record<string, unknown>) => api('POST', `/api/v1/meetings/pages/${pageId}/book`, data),
};

export const callsApi = {
  list: (params?: string) => api('GET', `/api/v1/calls${params ? '?' + params : ''}`),
  create: (data: Record<string, unknown>) => api('POST', '/api/v1/calls', data),
  stats: () => api('GET', '/api/v1/calls/stats'),
};
