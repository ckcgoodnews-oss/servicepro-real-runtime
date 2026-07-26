// Platform Administration > Tenant Management > Storage
// Per-tenant storage usage breakdown with limits and alerts.

export type StorageInfo = {
  tenantId: string;
  tenantName: string;
  storageBytes: number;
  storageLimitBytes: number;
  mediaCount: number;
  breakdown: {
    documents: number;
    images: number;
    attachments: number;
    other: number;
  };
  percentUsed: number;
};

export type StoragePageProps = {
  tenants: StorageInfo[];
  totalStorageBytes: number;
  totalLimitBytes: number;
};

export function StoragePage(props: StoragePageProps) {
  return {
    component: 'StoragePage',
    tenants: props.tenants,
    totalStorageBytes: props.totalStorageBytes,
    totalLimitBytes: props.totalLimitBytes,
    columns: [
      { key: 'tenantName', label: 'Tenant', sortable: true },
      { key: 'storageBytes', label: 'Used', sortable: true, format: 'bytes' },
      { key: 'storageLimitBytes', label: 'Limit', format: 'bytes' },
      { key: 'percentUsed', label: 'Usage', type: 'progress-bar' },
      { key: 'mediaCount', label: 'Files', sortable: true }
    ],
    alerts: {
      warning: 80,
      critical: 95
    },
    dataEndpoint: 'GET /api/v1/platform/tmc/:tenantId/usage'
  };
}
