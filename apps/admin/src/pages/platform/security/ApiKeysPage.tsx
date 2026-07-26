// Platform Administration > Security > API Keys
// Create, list, and revoke API keys per tenant.

export type ApiKeyRecord = {
  id: string;
  tenantId: string;
  tenantName: string;
  name: string;
  lastFour: string;
  expiresAt: string;
  createdAt: string;
  revokedAt: string;
};

export type ApiKeysPageProps = {
  keys: ApiKeyRecord[];
  selectedTenantId?: string;
};

export function ApiKeysPage(props: ApiKeysPageProps) {
  return {
    component: 'ApiKeysPage',
    keys: props.keys,
    selectedTenantId: props.selectedTenantId,
    columns: [
      { key: 'name', label: 'Name', sortable: true },
      { key: 'tenantName', label: 'Tenant', sortable: true },
      { key: 'lastFour', label: 'Key', format: 'masked', prefix: '****' },
      { key: 'expiresAt', label: 'Expires', format: 'date' },
      { key: 'createdAt', label: 'Created', sortable: true, format: 'date' },
      { key: 'actions', label: '', type: 'actions' }
    ],
    actions: [
      { key: 'revoke', label: 'Revoke', endpoint: 'POST /api/v1/platform/tenant-management/:tenantId/api-keys/:keyId/revoke', destructive: true, confirm: true }
    ],
    createForm: {
      fields: [
        { key: 'tenantId', label: 'Tenant', type: 'tenant-select', required: true },
        { key: 'name', label: 'Key Name', type: 'text', required: true },
        { key: 'expiresAt', label: 'Expiration (optional)', type: 'datetime' }
      ],
      endpoint: 'POST /api/v1/platform/tenant-management/:tenantId/api-keys',
      successMessage: 'API key created. Copy the token now - it will not be shown again.'
    }
  };
}
