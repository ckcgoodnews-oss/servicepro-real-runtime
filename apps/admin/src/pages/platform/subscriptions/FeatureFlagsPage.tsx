// Platform Administration > Subscription Management > Feature Flags
// Module enable/disable, beta program, per-tenant configuration.

export type ModuleConfig = {
  id: string;
  tenantId: string;
  moduleKey: string;
  enabled: boolean;
  isBeta: boolean;
  config: Record<string, unknown>;
  enabledAt: string;
  disabledAt: string;
};

export type FeatureFlagsPageProps = {
  tenantId: string;
  tenantName: string;
  modules: ModuleConfig[];
  availableModules: string[];
};

export function FeatureFlagsPage(props: FeatureFlagsPageProps) {
  return {
    component: 'FeatureFlagsPage',
    tenantId: props.tenantId,
    tenantName: props.tenantName,
    modules: props.modules,
    availableModules: props.availableModules || [
      'operations', 'crm', 'assets', 'inventory', 'billing',
      'analytics', 'knowledge', 'communications', 'marketplace',
      'administration', 'ai-platform', 'dispatch-optimization',
      'customer-portal', 'mobile-app', 'advanced-reporting',
      'multi-location', 'franchise-mode', 'white-label'
    ],
    columns: [
      { key: 'moduleKey', label: 'Module', sortable: true },
      { key: 'enabled', label: 'Enabled', type: 'toggle' },
      { key: 'isBeta', label: 'Beta', type: 'badge' },
      { key: 'enabledAt', label: 'Enabled Since', format: 'date' }
    ],
    toggleEndpoint: 'PUT /api/v1/platform/tmc/:tenantId/modules/:moduleKey',
    listEndpoint: 'GET /api/v1/platform/tmc/:tenantId/modules'
  };
}
