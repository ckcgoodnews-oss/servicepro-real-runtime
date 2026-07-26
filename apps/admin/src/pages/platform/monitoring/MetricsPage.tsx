// Platform Administration > Monitoring > Metrics
// Real-time and historical metrics across the platform.

export type PlatformMetrics = {
  timestamp: string;
  totalTenants: number;
  activeTenants: number;
  totalUsers: number;
  totalApiCalls: number;
  avgResponseTimeMs: number;
  errorRate: number;
  storageUtilization: number;
  activeImpersonations: number;
};

export type MetricsPageProps = {
  current: PlatformMetrics;
  history: PlatformMetrics[];
  period: '1h' | '24h' | '7d' | '30d';
};

export function MetricsPage(props: MetricsPageProps) {
  return {
    component: 'MetricsPage',
    current: props.current,
    history: props.history,
    period: props.period,
    kpis: [
      { key: 'activeTenants', label: 'Active Tenants', format: 'number' },
      { key: 'totalUsers', label: 'Total Users', format: 'number' },
      { key: 'totalApiCalls', label: 'API Calls', format: 'number' },
      { key: 'avgResponseTimeMs', label: 'Avg Response', format: 'ms' },
      { key: 'errorRate', label: 'Error Rate', format: 'percent' },
      { key: 'storageUtilization', label: 'Storage Used', format: 'percent' }
    ],
    charts: [
      { key: 'api-calls', type: 'area', dataKey: 'totalApiCalls', label: 'API Calls Over Time' },
      { key: 'response-time', type: 'line', dataKey: 'avgResponseTimeMs', label: 'Response Time' },
      { key: 'error-rate', type: 'line', dataKey: 'errorRate', label: 'Error Rate', threshold: 5 },
      { key: 'tenants', type: 'bar', dataKey: 'activeTenants', label: 'Active Tenants' }
    ],
    periodOptions: ['1h', '24h', '7d', '30d'],
    dataEndpoint: 'GET /api/v1/platform/tmc/:tenantId/usage'
  };
}
