// Platform Administration - Dashboard
// Provides a high-level overview of all tenants, system health, and quick actions.

export type DashboardStats = {
  totalTenants: number;
  activeTenants: number;
  trialTenants: number;
  suspendedTenants: number;
  archivedTenants: number;
  totalOwners: number;
  totalUsers: number;
  activeImpersonations: number;
  systemHealthScore: number;
  recentAuditEvents: number;
};

export type DashboardPageProps = {
  stats: DashboardStats;
  recentActivity: Array<{ action: string; tenantId: string; actorId: string; createdAt: string }>;
  healthAlerts: Array<{ tenantId: string; score: number; issues: string[] }>;
};

export function DashboardPage(props: DashboardPageProps) {
  return {
    component: 'PlatformDashboardPage',
    stats: props.stats,
    recentActivity: props.recentActivity,
    healthAlerts: props.healthAlerts,
    sections: [
      { key: 'kpis', label: 'Key Metrics', layout: 'grid-4' },
      { key: 'health-alerts', label: 'Health Alerts', layout: 'list' },
      { key: 'recent-activity', label: 'Recent Activity', layout: 'timeline' },
      { key: 'quick-actions', label: 'Quick Actions', layout: 'action-bar' }
    ],
    quickActions: [
      { action: 'create-tenant', label: 'Create Tenant', method: 'POST', endpoint: '/api/v1/platform/tmc/tenants' },
      { action: 'bulk-status', label: 'Bulk Update', method: 'POST', endpoint: '/api/v1/platform/tmc/bulk-status' },
      { action: 'health-check-all', label: 'Run Health Check', method: 'GET', endpoint: '/api/v1/platform/tmc/:id/health' }
    ]
  };
}
