// Platform Administration > Monitoring > Health
// Tenant health monitoring dashboard with scores and issues.

export type TenantHealth = {
  tenantId: string;
  tenantName: string;
  score: number;
  status: 'healthy' | 'attention' | 'critical';
  issues: string[];
  lastCheckedAt: string;
  usage: {
    usersCount: number;
    customersCount: number;
    jobsCount: number;
    storageBytes: number;
    errorCount: number;
  };
};

export type HealthPageProps = {
  tenants: TenantHealth[];
  overallScore: number;
  criticalCount: number;
  attentionCount: number;
};

export function HealthPage(props: HealthPageProps) {
  return {
    component: 'HealthPage',
    tenants: props.tenants,
    overallScore: props.overallScore,
    criticalCount: props.criticalCount,
    attentionCount: props.attentionCount,
    columns: [
      { key: 'tenantName', label: 'Tenant', sortable: true },
      { key: 'score', label: 'Health Score', sortable: true, type: 'score-badge' },
      { key: 'status', label: 'Status', type: 'status-indicator' },
      { key: 'issues', label: 'Issues', type: 'issue-list' },
      { key: 'lastCheckedAt', label: 'Last Check', format: 'relative-time' },
      { key: 'actions', label: '', type: 'actions' }
    ],
    actions: [
      { key: 'check-now', label: 'Run Health Check', endpoint: 'GET /api/v1/platform/tmc/:tenantId/health' }
    ],
    statusThresholds: {
      healthy: { min: 80, color: 'green' },
      attention: { min: 50, color: 'yellow' },
      critical: { min: 0, color: 'red' }
    },
    refreshInterval: 60000
  };
}
