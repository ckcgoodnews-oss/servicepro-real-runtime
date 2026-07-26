// Platform Administration > AI & Models > Models
// Available AI models, provider status, capabilities.

export type AiModel = {
  key: string;
  label: string;
  provider: string;
  status: 'available' | 'degraded' | 'unavailable';
  capabilities: string[];
};

export type ModelsPageProps = {
  models: AiModel[];
};

export function ModelsPage(props: ModelsPageProps) {
  return {
    component: 'AiModelsPage',
    models: props.models,
    columns: [
      { key: 'label', label: 'Model', sortable: true },
      { key: 'provider', label: 'Provider', sortable: true },
      { key: 'status', label: 'Status', type: 'status-indicator' },
      { key: 'capabilities', label: 'Capabilities', type: 'badges' }
    ],
    dataEndpoint: 'GET /api/v1/platform/tmc/ai/models'
  };
}
