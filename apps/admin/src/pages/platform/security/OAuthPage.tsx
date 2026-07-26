// Platform Administration > Security > OAuth
// OAuth client management: create clients, manage scopes, revoke.

export type OAuthClient = {
  id: string;
  tenantId: string;
  tenantName: string;
  clientName: string;
  clientId: string;
  redirectUris: string[];
  scopes: string[];
  rateLimitRpm: number;
  createdAt: string;
};

export type OAuthPageProps = {
  clients: OAuthClient[];
  selectedTenantId?: string;
};

export function OAuthPage(props: OAuthPageProps) {
  return {
    component: 'OAuthPage',
    clients: props.clients,
    selectedTenantId: props.selectedTenantId,
    columns: [
      { key: 'clientName', label: 'Name', sortable: true },
      { key: 'tenantName', label: 'Tenant', sortable: true },
      { key: 'clientId', label: 'Client ID', format: 'code' },
      { key: 'scopes', label: 'Scopes', type: 'badges' },
      { key: 'rateLimitRpm', label: 'Rate Limit (RPM)' },
      { key: 'createdAt', label: 'Created', format: 'date' },
      { key: 'actions', label: '', type: 'actions' }
    ],
    actions: [
      { key: 'revoke', label: 'Revoke', endpoint: 'POST /api/v1/platform/tmc/:tenantId/oauth-clients/:clientId/revoke', destructive: true }
    ],
    createForm: {
      fields: [
        { key: 'tenantId', label: 'Tenant', type: 'tenant-select', required: true },
        { key: 'clientName', label: 'Client Name', type: 'text', required: true },
        { key: 'redirectUris', label: 'Redirect URIs', type: 'multi-text', placeholder: 'https://app.example.com/callback' },
        { key: 'scopes', label: 'Scopes', type: 'multi-select', options: ['read', 'write', 'admin', 'billing', 'users', 'jobs', 'customers'] },
        { key: 'rateLimitRpm', label: 'Rate Limit (requests/min)', type: 'number', default: 60 }
      ],
      endpoint: 'POST /api/v1/platform/tmc/:tenantId/oauth-clients',
      successMessage: 'OAuth client created. Copy the client secret now - it will not be shown again.'
    }
  };
}
