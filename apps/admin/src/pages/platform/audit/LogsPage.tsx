// Platform Administration > Audit > Logs
// Full audit history with search, filtering, and export.

export type AuditLogEntry = {
  id: string;
  tenantId: string;
  actorId: string;
  actorEmail?: string;
  action: string;
  metadata: Record<string, unknown>;
  createdAt: string;
};

export type LogsPageProps = {
  logs: AuditLogEntry[];
  filters: {
    tenantId?: string;
    action?: string;
    actorId?: string;
    from?: string;
    to?: string;
  };
  totalCount: number;
};

export function LogsPage(props: LogsPageProps) {
  return {
    component: 'AuditLogsPage',
    logs: props.logs,
    filters: props.filters,
    totalCount: props.totalCount,
    columns: [
      { key: 'createdAt', label: 'Timestamp', sortable: true, format: 'datetime' },
      { key: 'tenantId', label: 'Tenant', sortable: true },
      { key: 'actorId', label: 'Actor', sortable: true },
      { key: 'action', label: 'Action', sortable: true, type: 'code' },
      { key: 'metadata', label: 'Details', type: 'json-preview' }
    ],
    filterControls: [
      { key: 'tenantId', label: 'Tenant', type: 'tenant-select' },
      { key: 'action', label: 'Action', type: 'text', placeholder: 'e.g. tenant.create, impersonation.start' },
      { key: 'actorId', label: 'Actor ID', type: 'text' },
      { key: 'from', label: 'From Date', type: 'datetime' },
      { key: 'to', label: 'To Date', type: 'datetime' }
    ],
    searchEndpoint: 'GET /api/v1/platform/tmc/:tenantId/audit',
    exportEndpoint: 'POST /api/v1/platform/tmc/:tenantId/audit/export',
    exportFormats: ['json', 'csv'],
    auditCategories: [
      'tenant.create', 'tenant.update', 'tenant.bulk_status',
      'tenant.permanent_purge',
      'owner.transfer_in', 'owner.transfer_out',
      'owner.soft_delete', 'owner.restore',
      'impersonation.start', 'impersonation.end', 'impersonation.terminate_all',
      'subscription.update', 'billing.event',
      'module.set', 'branding.update', 'white_label.update',
      'domain.save', 'api_key.create', 'api_key.revoke',
      'oauth_client.create', 'oauth_client.revoke',
      'webhook.create', 'webhook.delete'
    ]
  };
}
